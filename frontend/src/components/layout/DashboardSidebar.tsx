import { useNavigate } from "react-router-dom";

type SidebarItem = {
  id: string;
  label: string;
  path?: string;
};

type SidebarConfig = {
  title: string;
  items: SidebarItem[];
};

const sidebarByRole: Record<number, SidebarConfig> = {
  1: {
    title: "管理機能",
    items: [
      { id: "training", label: "研修配属", path: "/admin/training" },
      { id: "plan", label: "研修テンプレ", path: "/admin/plans" },
      { id: "diary", label: "日報管理", path: "/admin/diary" },
      { id: "qa", label: "質疑管理", path: "/admin/questions" },
      { id: "account", label: "アカウント管理", path: "/admin/accounts" },
    ],
  },
  2: {
    title: "管理機能",
    items: [
      { id: "training", label: "研修配属", path: "/teacher/training" },
      { id: "plan", label: "研修テンプレ", path: "/teacher/plans" },
      { id: "diary", label: "日報管理", path: "/teacher/diary" },
      { id: "qa", label: "質疑管理", path: "/teacher/questions" },
      { id: "account", label: "アカウント管理", path: "/teacher/accounts" },
    ],
  },
  3: {
    title: "マイページ",
    items: [
      { id: "dashboard", label: "ダッシュボード", path: "/student/dashboard" },
      { id: "training", label: "研修進捗", path: "/student/training" },
      { id: "diary", label: "日報", path: "/student/diary" },
      { id: "qa", label: "質疑", path: "/student/questions" },
      { id: "todo", label: "TODO" },
    ],
  },
};

type DashboardSidebarProps = {
  active?: string;
  role?: number;
  roleLabel?: string;
};

export function DashboardSidebar({
  active = "schedule",
  role = 1,
  roleLabel = "管理者",
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const config = sidebarByRole[role] ?? sidebarByRole[1];

  return (
    <aside className="hidden h-screen w-72 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950/80 text-slate-100 lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-lg font-semibold text-white">
          TS
        </div>
        <div>
          <p className="text-xs font-medium text-slate-300 tracking-wide">
            個人研修管理システム
          </p>
          <p className="text-sm font-semibold text-white">{roleLabel}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {config.title}
        </p>
        <nav className="space-y-1">
          {config.items.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => item.path && navigate(item.path)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5"
                  } ${item.path ? "" : "cursor-not-allowed opacity-60"}`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
        © {new Date().getFullYear()} Minami Training
      </div>
    </aside>
  );
}
