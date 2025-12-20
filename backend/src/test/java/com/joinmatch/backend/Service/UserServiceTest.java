package com.joinmatch.backend.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.joinmatch.backend.config.JwtService;
import com.joinmatch.backend.dto.Auth.*;
import com.joinmatch.backend.dto.ChangePass.ChangePassDto;
import com.joinmatch.backend.dto.Moderator.GetUsersDto;
import com.joinmatch.backend.dto.Reports.UserReportDto;
import com.joinmatch.backend.model.*;
import com.joinmatch.backend.repository.*;
import com.joinmatch.backend.service.GoogleTokenVerifier;
import com.joinmatch.backend.service.UserService;
import com.joinmatch.backend.supportObject.RefreshSupportObject;
import com.joinmatch.backend.supportObject.TokenSupportObject;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private FriendRequestRepository friendRequestRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private JoinMatchTokenRepository joinMatchTokenRepository;
    @Mock private FriendshipRepository friendshipRepository;
    @Mock private GoogleTokenVerifier tokenVerifier;
    @Mock private ReportUserRepository reportUserRepository;
    @Mock private com.joinmatch.backend.service.EmailService emailService;

    @InjectMocks
    private UserService userService;

    // -------------------------------------------------------------------------
    // REGISTER
    // -------------------------------------------------------------------------
    @Test
    void register_shouldSaveUser_whenEmailNotExists() {
        RegisterRequest req = new RegisterRequest("Kuba", "a@a.com", "pass", "2000-01-01");

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pass")).thenReturn("HASH");

        userService.register(req);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_shouldThrow_whenEmailExists() {
        RegisterRequest req = new RegisterRequest("Kuba", "a@a.com", "pass", "2000-01-01");

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> userService.register(req));
    }

    // -------------------------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------------------------
    @Test
    void login_shouldReturnTokens_whenCredentialsCorrect() {
        LoginRequest req = new LoginRequest("a@a.com", "pass");

        User u = new User();
        u.setPassword("HASH");
        u.setIsBlocked(false);
        u.setIsVerified(true);

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("pass", "HASH")).thenReturn(true);
        when(jwtService.generateToken(u)).thenReturn("T");
        when(jwtService.generateRefreshToken(u)).thenReturn("R");

        TokenSupportObject out = userService.login(req);

        assertEquals("T", out.getToken());
        verify(joinMatchTokenRepository).save(any());
    }

    @Test
    void login_shouldThrow_whenPasswordInvalid() {
        LoginRequest req = new LoginRequest("a@a.com", "pass");
        User u = new User();
        u.setPassword("HASH");

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(RuntimeException.class, () -> userService.login(req));
    }

    @Test
    void login_shouldThrow_whenUserBlocked() {
        LoginRequest req = new LoginRequest("a@a.com", "pass");
        User u = new User();
        u.setPassword("HASH");
        u.setIsBlocked(true);
        u.setIsVerified(true);

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(u));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.login(req));
    }

    // -------------------------------------------------------------------------
    // REFRESH TOKEN
    // -------------------------------------------------------------------------
    @Test
    void refreshToken_shouldReturnNewTokens_whenValid() {
        User u = new User();
        JoinMatchToken t = new JoinMatchToken();
        t.setUser(u);
        t.setRevoked(false);
        t.setExpireDate(LocalDateTime.now().plusHours(1));

        when(joinMatchTokenRepository.getJoinMatchTokenByRefreshToken("REF"))
                .thenReturn(Optional.of(List.of(t)));

        when(jwtService.generateToken(any())).thenReturn("T");
        when(jwtService.generateRefreshToken(any())).thenReturn("R");

        RefreshSupportObject out = userService.refreshToken("REF");

        assertEquals("T", out.getTokenSupportObject().getToken());
    }

    @Test
    void refreshToken_shouldThrow_whenTokenMissing() {
        when(joinMatchTokenRepository.getJoinMatchTokenByRefreshToken(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.refreshToken("BAD"));
    }

    // -------------------------------------------------------------------------
    // LOGOUT
    // -------------------------------------------------------------------------
    @Test
    void logoutUser_shouldRevokeTokens() {
        User u = new User();
        JoinMatchToken t1 = new JoinMatchToken();
        t1.setRevoked(false);
        JoinMatchToken t2 = new JoinMatchToken();
        t2.setRevoked(false);

        u.addToken(t1);
        u.addToken(t2);

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(u));

        userService.logoutUser("a@a.com");

        assertTrue(t1.getRevoked());
        assertTrue(t2.getRevoked());
    }

    // -------------------------------------------------------------------------
    // CHANGE PASSWORD
    // -------------------------------------------------------------------------
    @Test
    void changePassword_shouldUpdate_whenOldPasswordMatches() {
        User u = new User();
        u.setPassword("HASH");

        ChangePassDto dto = new ChangePassDto("old", "new");

        when(userRepository.findByTokenValue("T")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("old", "HASH")).thenReturn(true);
        when(passwordEncoder.encode("new")).thenReturn("N_HASH");

        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", "T");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        userService.changePassword(dto, request);

        assertEquals("N_HASH", u.getPassword());
    }

    @Test
    void changePassword_shouldThrow_whenOldPasswordWrong() {
        User u = new User();
        u.setPassword("HASH");

        ChangePassDto dto = new ChangePassDto("old", "new");

        when(userRepository.findByTokenValue("T")).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("old", "HASH")).thenReturn(false);

        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", "T");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        assertThrows(RuntimeException.class, () -> userService.changePassword(dto, request));
    }

    // -------------------------------------------------------------------------
    // SIMPLE INFO
    // -------------------------------------------------------------------------
    @Test
    void getSimpleInfo_shouldReturnDto() {
        User u = new User();
        u.setName("Kuba");
        u.setEmail("x@x.com");

        when(userRepository.findByTokenValue("T")).thenReturn(Optional.of(u));

        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", "T");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        var dto = userService.getSimpleInfo(request);

        assertEquals("Kuba", dto.name());
    }

    @Test
    void getSimpleInfo_shouldThrow_whenMissing() {
        when(userRepository.findByTokenValue(any())).thenReturn(Optional.empty());

        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", "T");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        assertThrows(IllegalArgumentException.class, () -> userService.getSimpleInfo(request));
    }

    // -------------------------------------------------------------------------
    // UPDATE PHOTO
    // -------------------------------------------------------------------------
    @Test
    void updateUserPhoto_shouldSave() {
        User u = new User();

        when(userRepository.findByTokenValue("T")).thenReturn(Optional.of(u));

        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", "T");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        userService.updateUserPhoto("URL", request);

        assertEquals("URL", u.getUrlOfPicture());
        verify(userRepository).save(u);
    }

    // -------------------------------------------------------------------------
    // SEARCH USERS
    // -------------------------------------------------------------------------
    @Test
    void searchUsers_shouldBuildProperResponse() {
        User sender = new User();
        sender.setId(1);

        User u2 = new User();
        u2.setId(2);
        u2.setEmail("two@x.com");
        u2.setName("Two");

        when(userRepository.searchByNameOrEmail("two"))
                .thenReturn(List.of(u2));

        when(userRepository.findById(1))
                .thenReturn(Optional.of(sender));

        when(friendRequestRepository.findBySender(sender))
                .thenReturn(List.of());

        when(friendRequestRepository.findByReceiver(sender))
                .thenReturn(List.of());

        when(friendshipRepository.findByUserOneOrUserTwo(sender, sender))
                .thenReturn(List.of());

        var out = userService.searchUsers("two", 1);

        assertEquals(1, out.size());
        assertEquals("Two", out.get(0).name());
    }

    // -------------------------------------------------------------------------
    // GET USER BY ID
    // -------------------------------------------------------------------------
    @Test
    void getUserById_shouldReturnResponse() {
        User target = new User();
        target.setId(10);
        target.setName("Kuba");
        target.setEmail("x@x.com");
        target.setDateOfBirth(LocalDate.of(2000, 1, 1));

        when(userRepository.findById(10)).thenReturn(Optional.of(target));
        when(friendshipRepository.findByUserOneOrUserTwo(target, target))
                .thenReturn(List.of());

        var dto = userService.getUserById(10, null);

        assertEquals(10, dto.id());
        assertEquals("Kuba", dto.name());
    }

    @Test
    void getUserById_shouldThrow_whenMissing() {
        when(userRepository.findById(10)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.getUserById(10, null));
    }

    // -------------------------------------------------------------------------
    // BLOCK USER
    // -------------------------------------------------------------------------
    @Test
    void changeStatusOfBlock_shouldSaveNewState() {
        User u = new User();
        u.setIsBlocked(false);

        when(userRepository.findByEmail("a@a.com")).thenReturn(Optional.of(u));

        userService.changeStatusOfBlock("a@a.com", true);

        assertTrue(u.getIsBlocked());
    }

    // -------------------------------------------------------------------------
    // GET USERS FOR MODERATION
    // -------------------------------------------------------------------------
    @Test
    void getUsersForModeration_shouldMapToDto() {
        User u = new User();
        u.setId(5);
        u.setName("Kuba");
        u.setEmail("x@x.com");
        u.setIsBlocked(false);

        Page<User> page = new PageImpl<>(List.of(u));

        when(userRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<GetUsersDto> out = userService.getUsersForModeration(Pageable.unpaged());

        assertEquals(1, out.getTotalElements());
        assertEquals("Kuba", out.getContent().get(0).username());
    }

    // -------------------------------------------------------------------------
    // GOOGLE LOGIN
    // -------------------------------------------------------------------------
    @Test
    void loginByGoogle_shouldCreateUserIfNotExist() {
        GoogleAuthRequest req = new GoogleAuthRequest("ID_TOKEN");

        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("x@x.com");
        payload.set("name", "Kuba");

        when(tokenVerifier.verify("ID_TOKEN")).thenReturn(payload);

        when(userRepository.findByEmail("x@x.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any())).thenReturn("T");
        when(jwtService.generateRefreshToken(any())).thenReturn("R");

        JwtResponse response = userService.loginByGoogle(req);

        assertEquals("T", response.token());
        assertEquals("x@x.com", response.email());
    }


    @Test
    void loginByGoogle_shouldThrow_whenPayloadNull() {
        GoogleAuthRequest req = new GoogleAuthRequest("BAD");

        when(tokenVerifier.verify("BAD")).thenReturn(null);

        assertThrows(IllegalArgumentException.class, () -> userService.loginByGoogle(req));
    }

    // -------------------------------------------------------------------------
    // REPORT USER
    // -------------------------------------------------------------------------
    @Test
    void reportUser_shouldSaveReport() {
        User reporter = new User();
        reporter.setUserReportSender(new HashSet<>());

        User suspect = new User();
        suspect.setSuspectUser(new HashSet<>());

        UserReportDto dto = new UserReportDto(2, "desc");

        when(userRepository.findByTokenValue("T")).thenReturn(Optional.of(reporter));
        when(userRepository.findById(2)).thenReturn(Optional.of(suspect));

        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("accessToken", "T");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});

        userService.reportUser(dto, request);

        verify(reportUserRepository).save(any(ReportUser.class));
        assertEquals(1, reporter.getUserReportSender().size());
        assertEquals(1, suspect.getSuspectUser().size());
    }
}
