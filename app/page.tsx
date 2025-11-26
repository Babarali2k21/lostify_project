"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "../components/SearchBar";
import { Button } from "../components/button";
import { PlusCircle, Package, LogIn } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs";
import { ItemCard } from "../components/ItemCard";
import { useAuth } from "../hooks/useAuth";
import { AuthDialogs } from "../components/dialogs/AuthDialogs";

// Mock data for demonstration
const mockItems = [
  {
    id: '1',
    title: 'Brown Leather Wallet',
    category: 'Wallet',
    status: 'lost' as const,
    location: 'UIBK Main Building (Hauptgebäude), Innrain 52',
    date: 'Nov 5, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1585401586477-2a671e1cae4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3N0JTIwaXRlbXMlMjB3YWxsZXR8ZW58MXx8fHwxNzYyNDMxNTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Lost my brown leather wallet containing ID cards and credit cards. Last seen near the entrance hall.',
    contactName: 'Lukas Müller',
    contactEmail: 'lukas.mueller@student.uibk.ac.at',
    contactPhone: '+43 664 123 4567'
  },
  {
    id: '2',
    title: 'Set of House Keys',
    category: 'Keys',
    status: 'found' as const,
    location: 'University Library (Universitätsbibliothek), Innrain 50',
    date: 'Nov 4, 2025',
    imageUrl: 'https://img.freepik.com/premium-photo/set-three-house-keys-ring-table-room-bunch-apartment-keys-close-up_653240-101.jpg',
    description: 'Found a set of keys with a blue keychain. Located at the information desk on ground floor.',
    contactName: 'Anna Berger',
    contactEmail: 'anna.berger@uibk.ac.at',
    contactPhone: '+43 664 234 5678'
  },
  {
    id: '3',
    title: 'Black Backpack',
    category: 'Bag',
    status: 'lost' as const,
    location: 'Mensa (Student Cafeteria), Herzog-Siegmund-Ufer 15',
    date: 'Nov 3, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1680039211156-66c721b87625?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMGJhZ3xlbnwxfHx8fDE3NjIzMzczODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Black Nike backpack with laptop inside. Contains important study materials and notebooks.',
    contactName: 'Michael Weber',
    contactEmail: 'michael.weber@student.uibk.ac.at',
    contactPhone: '+43 664 345 6789'
  },
  {
    id: '4',
    title: 'iPhone 14 Pro',
    category: 'Electronics',
    status: 'found' as const,
    location: 'Faculty of Law (Rechtswissenschaften), Innrain 52d',
    date: 'Nov 6, 2025',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKCUdMdZ3amQdpnObjwBvlKeukAW6mAihAog&s',
    description: 'Found an iPhone with a black case. Turned in to faculty administration office.',
    contactName: 'Julia Schneider',
    contactEmail: 'julia.schneider@uibk.ac.at',
    contactPhone: '+43 664 456 7890'
  },
  {
    id: '5',
    title: 'Blue Water Bottle',
    category: 'Personal Items',
    status: 'lost' as const,
    location: 'USI Sports Center (Universitäts-Sportinstitut), Fürstenweg 185',
    date: 'Nov 2, 2025',
    imageUrl: 'https://proworksbottles.com/cdn/shop/products/MetallicBlue_1L_Personalised_Main_Image_WEB_1020px_1200x.png?v=1739526888',
    description: 'Hydro Flask water bottle with stickers. Sentimental value. Lost in the gym area.',
    contactName: 'David Fischer',
    contactEmail: 'david.fischer@student.uibk.ac.at',
    contactPhone: '+43 664 567 8901'
  },
  {
    id: '6',
    title: 'Reading Glasses',
    category: 'Accessories',
    status: 'found' as const,
    location: 'Bruno Sander Building (Geologie), Innrain 52f',
    date: 'Nov 1, 2025',
    imageUrl: 'data:image/jpeg;base64,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',
    description: 'Black frame reading glasses found in lecture hall HS 5.',
    contactName: 'Sophie Bauer',
    contactEmail: 'sophie.bauer@uibk.ac.at',
    contactPhone: '+43 664 678 9012'
  }
];

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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  if (!loading && shouldOpenSignInFromQuery) {
    setSignInOpen(true);
    clearShouldOpenSignInFromQuery();
  }

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const handleReportItemClick = () => {
    if (loading) return;
    if (!user) {
      setSignInOpen(true);
      return;
    }
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
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} {...item} />
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



