"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "../components/SearchBar";
import { Button } from "../components/button";
import { PlusCircle, Package, LogIn } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs";
import { ItemCard } from "../components/ItemCard";
import { useAuth } from "../hooks/useAuth";
import { AuthDialogs } from "../components/dialogs/AuthDialogs";
import { ItemDetailsDialog } from "../components/dialogs/ItemDetailsDialog";

export default function Home() {
  const router = useRouter();
  const {
    user,
    loading,
    shouldOpenSignInFromQuery,
    clearShouldOpenSignInFromQuery,
    setUser,
    logout,
  } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/items");
        const data = await res.json();
        console.log("Loaded items:", data);
        setItems(data);
      } catch (e) {
        console.error("Failed to load items:", e);
      } finally {
        setLoadingItems(false);
      }
    }
    loadItems();
  }, []);

  if (!loading && shouldOpenSignInFromQuery) {
    setSignInOpen(true);
    clearShouldOpenSignInFromQuery();
  }

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      q === "" ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    const matchesTab = activeTab === "all" || item.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleReportItemClick = () => {
    if (loading) return;
    if (!user) {
      setSignInOpen(true);
      return;
    }
  };

  const handleContactOwner = () => {
    if (loading) return;
    if (!user) {
      setDetailsDialogOpen(false);
      setSignInOpen(true);
      return;
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-blue-600">Lost & Found</h1>
            </div>

            <div className="flex items-center gap-3">
              {user === undefined ? null : !user ? (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setSignInOpen(true)}
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={logout}
                >
                  Logout
                </Button>
              )}

              <Button className="gap-2" onClick={handleReportItemClick}>
                <PlusCircle className="h-5 w-5" />
                Report Item
              </Button>
            </div>
          </div>

          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"} found
          </p>
        </div>

        {loadingItems ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-gray-500">Loading items...</h3>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} {...item} onClick={() => handleItemClick(item)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p>Lost & Found - Helping reunite people with their belongings</p>
        </div>
      </footer>

      <ItemDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        item={selectedItem}
        onContactOwner={handleContactOwner}
      />

      <AuthDialogs
        signInOpen={signInOpen}
        onSignInOpenChange={setSignInOpen}
        signUpOpen={signUpOpen}
        onSignUpOpenChange={setSignUpOpen}
        verifyEmailOpen={verifyEmailOpen}
        onVerifyEmailOpenChange={setVerifyEmailOpen}
        verifyEmail={verifyEmail}
        setVerifyEmail={setVerifyEmail}
        forgotOpen={forgotOpen}
        onForgotOpenChange={setForgotOpen}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        onSignedIn={(user) => {
          setUser(user);
          router.push("/");
        }}
      />
    </div>
  );
}



