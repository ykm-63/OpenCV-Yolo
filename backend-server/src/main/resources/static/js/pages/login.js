const loginForm = document.getElementById("loginForm");
const userId = document.getElementById("userId");
const userPassword = document.getElementById("userPassword");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const id = userId.value.trim();
        const password = userPassword.value.trim();

        if (!id) {
            alert("아이디를 입력해주세요.");
            userId.focus();
            return;
        }

        if (!password) {
            alert("비밀번호를 입력해주세요.");
            userPassword.focus();
            return;
        }

        // 현재는 화면 테스트용 로그인입니다.
        // 실제 로그인 기능은 Spring Security 또는 세션 로그인 구현 시 연결합니다.
        if (id === "admin" && password === "1234") {
            location.href = "/home";
            return;
        }

        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    });
}