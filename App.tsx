import React, { useState, useEffect, useRef } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Filter,
  Bot,
  Megaphone,
  CheckSquare,
  Calendar as CalendarIcon,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  Building2,
  CreditCard,
  Server,
  UserCog,
  Box,
  LayoutTemplate,
  LifeBuoy,
  ScrollText,
  Globe,
  Moon,
  Sun,
  Plug,
  ChevronUp,
  User,
  Lock,
} from "lucide-react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { auth, db, initialAuthToken, appId } from "./lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Public Pages
import Landing from "./pages/Landing";
import ClientLogin from "./pages/auth/ClientLogin";
import AdminLogin from "./pages/auth/AdminLogin";

// Client Pages
import Dashboard from "./pages/client/Dashboard";
import Conversations from "./pages/client/Conversations";
import Contacts from "./pages/client/Contacts";
import Funnel from "./pages/client/Funnel";
import ChatbotBuilder from "./pages/client/ChatbotBuilder";
import Campaigns from "./pages/client/Campaigns";
import Tasks from "./pages/client/Tasks";
import Calendar from "./pages/client/Calendar";
import Reports from "./pages/client/Reports";
import Settings from "./pages/client/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminCompanyDetail from "./pages/admin/AdminCompanyDetail";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminInstances from "./pages/admin/AdminInstances";
import AdminModules from "./pages/admin/AdminModules";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminIntegrations from "./pages/admin/AdminIntegrations";

// Auth Types
type UserRole = "GUEST" | "CLIENT" | "SUPERADMIN";

// Interface de Permissões
interface AdminPermissions {
  finance: boolean;
  support: boolean;
  tech: boolean;
  sales: boolean;
  superadmin: boolean;
}

const defaultPermissions: AdminPermissions = {
  finance: false,
  support: false,
  tech: false,
  sales: false,
  superadmin: false,
};

interface SidebarItemProps {
  icon: any;
  label: string;
  to: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  to,
  active,
}) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
      active
        ? "bg-indigo-50 text-[#6C63FF] dark:bg-indigo-900/20 dark:text-[#818cf8]"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    }`}
  >
    {/* Ícone com cor da marca se ativo ou se estiver em hover (efeito visual melhorado) */}
    <Icon
      size={20}
      className={`transition-colors ${
        active
          ? "text-[#6C63FF] dark:text-[#818cf8]"
          : "text-gray-500 group-hover:text-[#6C63FF] dark:text-gray-500 dark:group-hover:text-[#818cf8]"
      }`}
    />
    <span>{label}</span>
  </Link>
);

interface LayoutProps {
  children: React.ReactNode;
  type: "client" | "admin";
  onLogout: () => void;
  user: { name: string; email: string; avatar: string };
  permissions?: AdminPermissions;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  type,
  onLogout,
  user,
  permissions,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estado do Tema (Dark Mode) - Com Persistência
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  // Estado do Menu de Usuário
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Efeito para aplicar o tema
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigateToSettings = () => {
    const path = type === "admin" ? "/admin/settings" : "/app/settings";
    navigate(path);
    setIsUserMenuOpen(false);
  };

  const clientLinks = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
    { icon: MessageSquare, label: "Conversas", path: "/app/conversations" },
    { icon: Users, label: "Contatos", path: "/app/contacts" },
    { icon: Filter, label: "Funil de Vendas", path: "/app/funnel" },
    { icon: Bot, label: "Chatbot", path: "/app/chatbot" },
    { icon: Megaphone, label: "Campanhas", path: "/app/campaigns" },
    { icon: CheckSquare, label: "Tarefas", path: "/app/tasks" },
    { icon: CalendarIcon, label: "Agenda", path: "/app/calendar" },
    { icon: BarChart3, label: "Relatórios", path: "/app/reports" },
    { icon: SettingsIcon, label: "Configurações", path: "/app/settings" },
  ];

  // Links Admin com Permissões Requeridas
  const allAdminLinks = [
    {
      icon: LayoutDashboard,
      label: "Dashboard Master",
      path: "/admin/dashboard",
      req: "any",
    },
    {
      icon: Building2,
      label: "Clientes (Empresas)",
      path: "/admin/companies",
      req: "sales",
    },
    {
      icon: Shield,
      label: "Planos e Assinaturas",
      path: "/admin/plans",
      req: "finance",
    },
    {
      icon: CreditCard,
      label: "Financeiro",
      path: "/admin/finance",
      req: "finance",
    },
    {
      icon: Server,
      label: "Instâncias WhatsApp",
      path: "/admin/instances",
      req: "tech",
    },
    {
      icon: Plug,
      label: "Integrações",
      path: "/admin/integrations",
      req: "tech",
    },
    { icon: Box, label: "Módulos", path: "/admin/modules", req: "sales" },
    {
      icon: LayoutTemplate,
      label: "Templates Globais",
      path: "/admin/templates",
      req: "support",
    },
    {
      icon: Users,
      label: "Equipe BidFlow",
      path: "/admin/team",
      req: "superadmin",
    },
    {
      icon: LifeBuoy,
      label: "Suporte (Tickets)",
      path: "/admin/support",
      req: "support",
    },
    {
      icon: ScrollText,
      label: "Logs & Auditoria",
      path: "/admin/logs",
      req: "tech",
    },
    {
      icon: Globe,
      label: "Configurações Sistema",
      path: "/admin/settings",
      req: "tech",
    },
  ];

  const adminLinks =
    type === "admin"
      ? allAdminLinks.filter((link) => {
          if (!permissions) return false;
          if (permissions.superadmin) return true;
          if (link.req === "any") return true;
          return permissions[link.req as keyof AdminPermissions];
        })
      : [];

  const links = type === "admin" ? adminLinks : clientLinks;

  return (
    <div
      className={`flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors duration-200 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full hidden md:flex z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
              type === "admin"
                ? "bg-[#ffffff] dark:bg-gray-800 dark:text-gray-800"
                : "bg-indigo-600"
            }`}
          >
            {type === "admin" ? "M" : "B"}
          </div>
          <span className="text-xl font-bold text-gray-800">
            {type === "admin" ? (
              <img
                src="/assets/logo-1200.png"
                alt="BidFlow Master"
                className="h-8 object-contain"
              />
            ) : (
              "BidFlow"
            )}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {links.map((link) => (
            <SidebarItem
              key={link.path}
              icon={link.icon}
              label={link.label}
              to={link.path}
              active={location.pathname.startsWith(link.path)}
            />
          ))}
        </nav>

        {/* Área do Usuário com Menu Dropdown */}
        <div
          className="p-4 border-t border-gray-100 dark:border-gray-700 relative"
          ref={userMenuRef}
        >
          {/* Menu Flutuante */}
          {isUserMenuOpen && (
            <div className="absolute bottom-20 left-4 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 z-50">
              <div className="p-1">
                {/* Botão Meu Perfil - Vai para Configurações */}
                <button
                  onClick={handleNavigateToSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <User size={16} className="text-gray-500" /> Meu Perfil
                </button>

                {/* Botão Alterar Senha - Vai para Configurações */}
                <button
                  onClick={handleNavigateToSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <Lock
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />{" "}
                  Alterar Senha
                </button>

                {/* Botão Preferências - Vai para Configurações */}
                <button
                  onClick={handleNavigateToSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <SettingsIcon
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />{" "}
                  Preferências
                </button>

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

                {/* Botão Modo Escuro - Funcional */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Sun size={16} className="text-orange-500" />
                    ) : (
                      <Moon size={16} className="text-gray-500" />
                    )}
                    <span>{isDarkMode ? "Modo Claro" : "Modo Escuro"}</span>
                  </div>
                </button>

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

                {/* Botão Sair */}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>
          )}

          {/* Cartão do Usuário (Clicável para abrir menu) */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-3 py-2 w-full hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition text-left group border border-transparent hover:border-gray-100 dark:hover:border-gray-600"
          >
            <img
              src={user.avatar}
              alt="User"
              className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 object-cover bg-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
            <ChevronUp
              size={16}
              className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 md:hidden justify-between">
          {/* NOVA LOGO MOBILE AQUI */}
          <img
            src="/assets/logo-1200.png"
            alt="BidFlow"
            className="h-8 object-contain"
          />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            Menu
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const [role, setRole] = useState<UserRole>("GUEST");
  const [userEmail, setUserEmail] = useState("");
  const [adminPermissions, setAdminPermissions] =
    useState<AdminPermissions>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, () => setIsLoading(false));
    return () => unsubscribe();
  }, []);

  const handleAdminLogin = async (email: string) => {
    setIsLoading(true);
    setUserEmail(email);

    if (email === "admin@bidflow.com" || email === "admin.master") {
      setAdminPermissions({ ...defaultPermissions, superadmin: true });
      setRole("SUPERADMIN");
      setIsLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "artifacts", appId, "team"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.status === "inactive") {
          alert("Acesso negado: Conta desativada.");
          setRole("GUEST");
          setIsLoading(false);
          return;
        }
        setAdminPermissions({
          superadmin: false,
          finance: userData.permissions?.finance || false,
          support: userData.permissions?.support || false,
          tech: userData.permissions?.tech || false,
          sales: userData.permissions?.sales || false,
        });
        setRole("SUPERADMIN");
      } else {
        alert("Usuário não encontrado na equipe.");
        setRole("GUEST");
      }
    } catch (error) {
      console.error("Erro permissões:", error);
      alert("Erro de conexão.");
      setRole("GUEST");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientLogin = () => {
    setRole("CLIENT");
  };

  const handleLogout = async () => {
    await signOut(auth); // Logout real
    setRole("GUEST");
    setUserEmail("");
    setAdminPermissions(defaultPermissions);
  };

  const userData =
    role === "SUPERADMIN"
      ? {
          name: userEmail.split("@")[0] || "Admin",
          email: userEmail || "admin@bidflow.com",
          avatar: `https://ui-avatars.com/api/?name=${
            userEmail || "Admin"
          }&background=6C63FF&color=fff`,
        }
      : {
          name: "Alex Vendor",
          email: "alex@company.com",
          avatar: "https://picsum.photos/200",
        };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Carregando...
      </div>
    );

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            role === "GUEST" ? (
              <Landing />
            ) : (
              <Navigate
                to={
                  role === "SUPERADMIN" ? "/admin/dashboard" : "/app/dashboard"
                }
              />
            )
          }
        />
        <Route
          path="/login"
          element={
            role === "GUEST" ? (
              <ClientLogin onLogin={handleClientLogin} />
            ) : (
              <Navigate to="/app/dashboard" />
            )
          }
        />
        <Route
          path="/master"
          element={
            role === "GUEST" ? (
              <AdminLogin onLogin={handleAdminLogin} />
            ) : (
              <Navigate to="/admin/dashboard" />
            )
          }
        />

        <Route
          path="/app/*"
          element={
            role === "CLIENT" ? (
              <Layout type="client" onLogout={handleLogout} user={userData}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="conversations" element={<Conversations />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="funnel" element={<Funnel />} />
                  <Route path="chatbot" element={<ChatbotBuilder />} />
                  <Route path="campaigns" element={<Campaigns />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/app/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            role === "SUPERADMIN" ? (
              <Layout
                type="admin"
                onLogout={handleLogout}
                user={userData}
                permissions={adminPermissions}
              >
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route
                    path="companies"
                    element={
                      adminPermissions.sales || adminPermissions.superadmin ? (
                        <AdminCompanies />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="companies/:id"
                    element={
                      adminPermissions.sales || adminPermissions.superadmin ? (
                        <AdminCompanyDetail />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="plans"
                    element={
                      adminPermissions.finance ||
                      adminPermissions.superadmin ? (
                        <AdminPlans />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="finance"
                    element={
                      adminPermissions.finance ||
                      adminPermissions.superadmin ? (
                        <AdminFinance />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="instances"
                    element={
                      adminPermissions.tech || adminPermissions.superadmin ? (
                        <AdminInstances />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="integrations"
                    element={
                      adminPermissions.tech || adminPermissions.superadmin ? (
                        <AdminIntegrations />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="logs"
                    element={
                      adminPermissions.tech || adminPermissions.superadmin ? (
                        <AdminLogs />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      adminPermissions.tech || adminPermissions.superadmin ? (
                        <AdminSettings />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="modules"
                    element={
                      adminPermissions.sales || adminPermissions.superadmin ? (
                        <AdminModules />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="templates"
                    element={
                      adminPermissions.support ||
                      adminPermissions.superadmin ? (
                        <AdminTemplates />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="support"
                    element={
                      adminPermissions.support ||
                      adminPermissions.superadmin ? (
                        <AdminSupport />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="team"
                    element={
                      adminPermissions.superadmin ? (
                        <AdminTeam />
                      ) : (
                        <Navigate to="/admin/dashboard" />
                      )
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/admin/dashboard" />}
                  />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/master" />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
