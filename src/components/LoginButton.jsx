import { useAuth } from "../context/AuthContext";

export default function LoginButton() {
  const { user, signIn, signOutUser } = useAuth();

  if (user === undefined) {
    return null; // ยังโหลดสถานะล็อกอินอยู่
  }

  if (!user) {
    return (
      <button className="login-btn" onClick={signIn}>
        เข้าสู่ระบบด้วย Google
      </button>
    );
  }

  return (
    <div className="user-chip">
      {user.photoURL && <img src={user.photoURL} alt="" className="user-avatar" />}
      <span className="user-name">{user.displayName}</span>
      <button className="logout-btn" onClick={signOutUser}>
        ออกจากระบบ
      </button>
    </div>
  );
}
