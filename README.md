# RealiTier

## Server

---

### 1. 사용 스택

- Node.js
- Express
- Socket.io
- MongoDB
- Redis
- Eslint
- Prettier

### 2. 구현 내용

- 파일 구조

  ```
  server
  ├─ .eslintrc.cjs
  ├─ index.js
  ├─ lib
  │  ├─ controllers
  │  │  ├─ account.js
  │  │  ├─ forJwt.js
  │  │  └─ sports
  │  │     ├─ matchMaker
  │  │     │  ├─ matchMaking.js
  │  │     │  └─ worker.js
  │  │     ├─ rps.js
  │  │     └─ utils.js
  │  ├─ models
  │  │  └─ user
  │  │     ├─ index.js
  │  │     └─ rps.js
  │  ├─ routes
  │  │  ├─ account.js
  │  │  ├─ middleware
  │  │  │  └─ index.js
  │  │  └─ sports
  │  │     ├─ index.js
  │  │     └─ rps.js
  │  └─ socket
  │     ├─ index.js
  │     └─ utils.js
  ├─ mongo.js
  ├─ package-lock.json
  ├─ package.json
  ├─ README.md
  └─ redis.js

  ```

---

#### 1) 계정 관련

- 회원 가입
  - url: /account/signup
  - method: POST
  - request: JSON
    ```
    req.body = {"email":String, "password":String, "nickname":String, "allowNotice":Boolean}
    ```
  - 설명: 위 양식으로 요청을 보낼 시, Main DB(MongoDB)에 해당 이메일의 사용자가 있는지 확인 후 없다면 계정 생성. 이 때 비밀번호 정보는 해시(단방향 암호화)되어 DB에 저장

---

- 로그인
  - url: /account/login
  - method: POST
  - request: JSON
    ```
    req.body = {"email":String, "password":String}
    ```
  - response: JSON
    ```
    {"accessToken":String, "refreshToken":String}
    ```
  - 설명: 위 양식으로 로그인 요청을 보낼 시, Main DB(MongoDB)에 해당 이메일의 사용자가 존재하는지 확인 후, 존재한다면 엑세스 토큰과 리프레쉬 토큰을 반환. 이 때 토큰들이 반환되기는 하지만, 동시에 응답을 통해 클라이언트의 쿠키에 엑세스 토큰과 리프레쉬 토큰을 httponly로 설정해주기 때문에 클라이언트 쪽에서 향후 요청 시 이를 신경 쓸 필요없도록 구현. 또한 리프레쉬 토큰을 cache DB(Redis)에 저장하여 토큰 갱신 시 이용할 수 있도록 함.

---

- 로그인 유지(JWT 이용)
  - 설명: 회원가입, 로그인 요청을 제외한 모든 요청에는 클라이언트 측 쿠키의 토큰이 유효한지 확인하는 미들웨어 프로세스가 존재. 이 때 엑세스 토큰과 리프레쉬 토큰이 모두 유효하다면 정상적으로 다음 단계로 넘어감. 만약 엑세스 토큰만 만료된 상황이라면 cache DB(Redis)의 리프레쉬 토큰과 클라이언트 측의 리프레쉬 토큰이 일치하는지 확인. 만약 일치한다면 새로운 엑세스 토큰을 발급하여 클라이언트 쿠키에 저장 후 기존에 접속하려했던 url에 리다이렉트. 만약 두 토큰 모두 유효하지 않다면, 로그인 url(/account/login)으로 리다이렉트.
  - 이점: 이를 통하면 서버와 클라이언트 간의 인증 절차에서 엑세스 토큰이 만료되더라도 클라이언트는 추가적인 절차를 밟지 않아도 됨. 즉 사용자의 만족도 증가. 또한 엑세스 토큰에 대한 세션 정보를 서버에서 저장하지 않기 때문에 서버의 부하를 줄일 수 있음.

---

- 로그아웃
  - url: /account/logout
  - method: GET
  - 설명: 위 url로 로그아웃 요청을 보내면, Cache DB(Redis)에 저장된 해당 사용자의 리프레쉬 토큰을 삭제한 뒤, 사용자의 브라우저의 엑세스 토큰과 리프레쉬 토큰을 삭제 후 /account/login으로 리다이렉트.

---

#### 2) 종목 별 구현

- 가위바위보
  - 회원 정보
    - url: /sports/rps/userinfo
    - method: GET
    - response: JSON
      ```
      {"email":String, "nickname":String, "allowNotice":Boolean, "eloRating":Number, "match":Number, "win":Number}
      ```

#### 3) 매칭 관련

- 매칭 시스템
  - 참고 : https://github.com/redis-developer/matcha
  - method: WebSocket(socket.io)
  - request: event 'matchMaking'
    ```
    {"email":String, "sport":String}
    // 예시 => {"email":"fanatic5500@gmail.com", "sport":"rps"}
    // 이 때 rps는 rock-paper-scissor
    ```
  - response: event 'makedMatch'
    ```
    {"player1":String, "player2":String, "roomId":String}
    // 예시 => {"player1":"fanatic5500@gmail.com", "player2":"fanatic5500@khu.ac.kr","roomId":randomUUID}
    ```
  - 설명: 실시간 매칭 시스템을 위해 웹소켓과 Redis의 pub/sub 이용. 클라이언트 측에서 'matchMaking' 이벤트와 함께 정보를 서버에 전송하면 해당 종목의 대기열에 사용자 정보(이메일), 해당 사용자의 elo rating, 해당 사용자가 대기열에 들어온 시각의 데이터를 삽입. 이 때 서버 프로세스 내부에 비동기적으로 작동하는 matchMaker가 무한 루프를 돌며 작동하는데, 이는 대기열 내 대기 시간이 가장 긴 사용자부터, 해당 사용자와 비슷한 실력 구간의(elo rating 상하로 200점 시작하여 15초마다 상하로 100점씩 추가되는 구간) 대기열 내 사용자 중 마찬가지로 가장 오래 대기한 이용자에 대해서 pub/sub 패턴을 통해 매치 메이킹 이벤트를 발생시킴. 이 와중에, 다른 클라이언트가 'matchMaking' 이벤트를 발생시키면 matchMaker가 해당 클라이언트를 확인 후 각 클라이언트에게 서로의 정보(이메일)와 방 번호를 반환

---

- 가위바위보(RockPaperScissor, RPS)
- method: WebSocket(socket.io)
- request: event 

### 3. challenge

- 메모리 누수
  - 초기 디자인에는 매칭 시스템을 worker_thread를 이용하여 비동기로 따로 처리하려 했지만, 콜백 힙에 worker가 계속 쌓여 힙이 터지는 현상이 발생.
  - 이를 파악하기 위해 chrome의 inspect를 활용했으며, 콜백 힙에 매칭 시스템이 0.1초마다 순차적으로 쌓이는 방식으로 구현하여 해결
  - chrome://inspect 관련 참고: https://ajh322.tistory.com/243?category=707635
