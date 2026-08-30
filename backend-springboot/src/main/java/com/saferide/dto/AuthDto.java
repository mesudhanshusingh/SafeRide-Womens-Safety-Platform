package com.saferide.dto;

public class AuthDto {

    public static class LoginRequest {
        private String email;
        private String password;

        public LoginRequest() {
        }

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
        private String emergencyPasscode;

        public RegisterRequest() {
        }

        public RegisterRequest(String name, String email, String password, String phone, String emergencyPasscode) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.phone = phone;
            this.emergencyPasscode = emergencyPasscode;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmergencyPasscode() {
            return emergencyPasscode;
        }

        public void setEmergencyPasscode(String emergencyPasscode) {
            this.emergencyPasscode = emergencyPasscode;
        }
    }

    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String role;
        private Long userId;

        public AuthResponse() {
        }

        public AuthResponse(String token, String email, String name, String role, Long userId) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.role = role;
            this.userId = userId;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }
}
