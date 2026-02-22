import { useState } from "react";
import {
  LayoutDashboard,
  Folders,
  History,
  LogOut,
  ExternalLink,
  Trash2,
  Instagram,
  ChevronRight,
  Filter,
  Search,
  PlusCircle,
  Sparkles
} from "lucide-react";

const categoryColors = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-pink-600",
  "from-amber-500 to-amber-600",
  "from-red-500 to-red-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600"
];

const parseAiResult = (result) => {
  if (!result) return "No description available.";
  const parts = result.split("\nSummary:");
  if (parts.length > 1) {
    return parts[1].trim();
  }
  // Fallback for different formats
  return result.replace(/Category:.*?\n/g, "").replace(/Summary:/g, "").replace(/It is Saved Now!!.*/g, "").trim();
};

const getCategory = (result) => {
  if (!result) return "Uncategorized";
  if (result.includes("Category:")) {
    return result.split("Category:")[1].split("\n")[0].trim();
  }
  return "Uncategorized";
};

export default function Dashboard({ userData, logout, refresh }) {
  if (!userData) return null;

  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = userData.categories || {};
  const allLinks = Object.values(categories).flat();

  // Sort links to show newest first if created_at exists
  const sortedLinks = [...allLinks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const deleteLink = async (id) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/delete-link/${id}`, {
        method: "DELETE"
      });
      refresh();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const isRecent = (date) => {
    const now = new Date();
    const created = new Date(date);
    return (now - created) / (1000 * 60 * 60) <= 24;
  };

  const getFilteredLinks = () => {
    const list = activeFilter === "All" ? sortedLinks : categories[activeFilter] || [];
    return list.filter(item =>
      (item.ai_result || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.url || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredLinks = getFilteredLinks();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "categories", label: "Collections", icon: Folders },
    { id: "recent", label: "Recent Saves", icon: History },
  ];

  const ReelCard = ({ item }) => (
    <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
          <Instagram className="w-5 h-5 text-pink-600" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
        </span>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 min-h-[4.5rem]">
        {parseAiResult(item.ai_result)}
      </p>

      <div className="mb-4">
        <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-tight">
          {getCategory(item.ai_result)}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
        >
          <ExternalLink className="w-4 h-4" />
          View
        </a>
        <button
          onClick={() => deleteLink(item._id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 p-8 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Social Saver</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === "dashboard") setActiveFilter("All");
                if (item.id === "categories") setSelectedCategory(null);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-blue-600" : "text-slate-400"}`} />
              {item.label}
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 transition-colors hover:bg-slate-100">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">User Account</p>
            <p className="text-sm font-semibold truncate">+{userData.phone}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-slate-200 hover:shadow-red-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              {activeTab === "dashboard" ? "My Workspace" :
                activeTab === "categories" ? "Collections" : "Recent Activity"}
            </h2>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {allLinks.length} total reels saved
            </p>
          </div>

          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search summary or url..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
            />
          </div>
        </header>

        {activeTab === "dashboard" && (
          <>
            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 mr-4 text-slate-400">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">Filter by category:</span>
              </div>
              <button
                onClick={() => setActiveFilter("All")}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${activeFilter === "All"
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-white border-gray-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm"
                  }`}
              >
                All
              </button>

              {Object.keys(categories).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${activeFilter === cat
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                    : "bg-white border-gray-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 shadow-sm"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredLinks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {filteredLinks.map(item => <ReelCard key={item._id} item={item} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-slate-400 shadow-sm">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No reels found in this selection</p>
              </div>
            )}
          </>
        )}

        {activeTab === "categories" && !selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {Object.entries(categories).map(([cat, links], index) => (
              <div
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`group p-8 rounded-3xl text-white cursor-pointer relative overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br ${categoryColors[index % categoryColors.length]}`}
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">{cat}</h3>
                  <p className="text-white/80 text-sm font-medium">{links.length} Reels</p>
                </div>
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform">
                  <PlusCircle className="w-16 h-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "categories" && selectedCategory && (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 mb-8 text-blue-600 font-bold hover:gap-3 transition-all group"
            >
              <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110" />
              Back to Collections
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
              {(categories[selectedCategory] || []).map(item => <ReelCard key={item._id} item={item} />)}
            </div>
          </>
        )}

        {activeTab === "recent" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {sortedLinks.filter(link => isRecent(link.created_at)).map(item => <ReelCard key={item._id} item={item} />)}
            {sortedLinks.filter(link => isRecent(link.created_at)).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-slate-400 shadow-sm">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No activity in the last 24 hours</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}