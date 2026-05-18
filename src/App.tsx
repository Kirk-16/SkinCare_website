import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Star, 
  ArrowRight, 
  Tag, 
  Globe, 
  LocateFixed,
  ChevronRight,
  User,
  Sparkles,
  LogOut,
  LogIn
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logout, OperationType, handleFirestoreError } from './lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product, BlogPost } from './types';
import { PRODUCTS, BLOG_POSTS, CATEGORIES, BRANDS } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const id = url.match(/[-\w]{25,}/);
    if (id) {
       return `https://drive.google.com/uc?export=view&id=${id[0]}`;
    }
  }
  return url;
};

// --- Auth Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Components ---

const Navbar = ({ wishlistCount, cartCount }: { wishlistCount: number, cartCount: number }) => {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [manualKey, setManualKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const saveKey = () => {
    localStorage.setItem('GEMINI_API_KEY', manualKey);
    setIsSettingsOpen(false);
    window.location.reload(); // Refresh to ensure all components use the new key
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-paper/80 backdrop-blur-md border-b border-primary/5 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-serif tracking-tighter hover:opacity-80 transition-opacity">
            Aura Glow
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/shop" className="text-xs uppercase tracking-widest font-medium luxury-link">Shop</Link>
            <Link to="/brands" className="text-xs uppercase tracking-widest font-medium luxury-link">Brands</Link>
            <Link to="/blog" className="text-xs uppercase tracking-widest font-medium luxury-link">Journal</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden md:block"><Search size={20} strokeWidth={1.5} /></button>
          <Link to="/wishlist" className="relative">
            <Heart size={20} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button className="relative">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center overflow-hidden hover:bg-primary/10 transition-colors"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={18} strokeWidth={1.5} />
              )}
            </button>
            <AnimatePresence>
              {isAccountOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-12 right-0 bg-paper border border-primary/5 shadow-xl p-4 min-w-[200px] rounded-sm"
                >
                  {user ? (
                    <div className="space-y-3">
                      <div className="pb-3 border-b border-primary/5">
                        <p className="text-xs font-bold uppercase tracking-widest leading-none mb-1 truncate">{user.displayName || 'Glow Member'}</p>
                        <p className="text-[10px] text-primary/40 truncate">{user.email}</p>
                      </div>
                      {user.email === 'kirklatras@gmail.com' && (
                        <Link to="/admin" onClick={() => setIsAccountOpen(false)} className="block w-full text-left text-[10px] uppercase tracking-widest font-bold hover:text-accent">Admin Dashboard</Link>
                      )}
                      <button onClick={() => { setIsSettingsOpen(true); setIsAccountOpen(false); }} className="w-full text-left text-[10px] uppercase tracking-widest font-bold hover:text-accent">Settings</button>
                      <button onClick={() => { logout(); setIsAccountOpen(false); }} className="w-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button onClick={() => { loginWithGoogle(); setIsAccountOpen(false); }} className="w-full flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-accent">
                        <LogIn size={14} /> Sign In with Google
                      </button>
                      <button onClick={() => { setIsSettingsOpen(true); setIsAccountOpen(false); }} className="w-full text-left text-[10px] uppercase tracking-widest font-bold hover:text-accent border-t border-primary/5 pt-2">API Key Settings</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-paper p-8 rounded-sm shadow-2xl relative z-10 w-full max-w-md border border-primary/5"
            >
              <h3 className="text-2xl font-serif mb-6">Aura Intelligence Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Manual Gemini API Key</label>
                  <input 
                    type="password"
                    placeholder="Enter your API Key"
                    className="w-full bg-primary/5 p-3 rounded-sm text-sm outline-none border border-transparent focus:border-accent"
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                  />
                  <p className="text-[10px] text-primary/40 italic">Stored locally in your browser. Leave blank to use default.</p>
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={saveKey} className="flex-1 bg-primary text-white py-3 text-[10px] uppercase tracking-widest font-bold">Save Changes</button>
                   <button onClick={() => setIsSettingsOpen(false)} className="flex-1 border border-primary/20 py-3 text-[10px] uppercase tracking-widest font-bold">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-paper z-[60] p-8 flex flex-col pt-24"
          >
            <button className="absolute top-8 right-8" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} strokeWidth={1.5} />
            </button>
            <div className="flex flex-col gap-8">
              <Link to="/shop" className="text-4xl font-serif" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
              <Link to="/brands" className="text-4xl font-serif" onClick={() => setIsMobileMenuOpen(false)}>Brands</Link>
              <Link to="/blog" className="text-4xl font-serif" onClick={() => setIsMobileMenuOpen(false)}>Journal</Link>
              <Link to="/wishlist" className="text-4xl font-serif" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ProductCard = ({ product, onWishlist, isWishlisted }: { product: Product, onWishlist: (p: Product) => void, isWishlisted: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="aspect-[3/4] overflow-hidden bg-primary/5 rounded-sm relative">
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button 
          onClick={() => onWishlist(product)}
          className={cn(
            "absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300",
            isWishlisted && "opacity-100 bg-accent text-white"
          )}
        >
          <Heart size={18} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        <div className="absolute top-4 left-4 flex gap-2">
           {product.isInternational ? (
             <span className="bg-primary/80 backdrop-blur-sm text-white px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1">
               <Globe size={10} /> International
             </span>
           ) : (
             <span className="bg-accent/80 backdrop-blur-sm text-white px-2 py-1 text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1">
               <LocateFixed size={10} /> Local Glow
             </span>
           )}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary/60 font-medium">{product.brand}</p>
            <h3 className="font-serif text-lg leading-tight group-hover:text-accent transition-colors">{product.name}</h3>
          </div>
          <p className="font-serif text-lg">${product.price}</p>
        </div>
        <div className="flex items-center gap-1 pt-1 opacity-60">
          <Star size={10} fill="currentColor" />
          <span className="text-[10px]">{product.rating} ({product.reviews} reviews)</span>
        </div>
      </div>
      <Link to={`/product/${product.id}`} className="absolute inset-0 z-0" />
    </motion.div>
  );
};

// --- Pages ---

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', brand: '', price: 0, category: 'Face', image: '', description: '', isInternational: false, rating: 5, reviews: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ ...doc.data() } as Product)));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const id = Date.now().toString();
      const productData = { ...newProduct, id };
      await setDoc(doc(db, 'products', id), productData);
      setIsAdding(false);
      setNewProduct({ name: '', brand: '', price: 0, category: 'Face', image: '', description: '', isInternational: false, rating: 5, reviews: 0 });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  };

  const isAdmin = user?.email === 'kirklatras@gmail.com';

  if (!isAdmin) return (
    <div className="pt-32 px-6 text-center space-y-4">
      <h1 className="text-2xl font-serif">Access Denied</h1>
      <p className="text-primary/60">Only administrators can manage the inventory.</p>
      <Link to="/" className="inline-block bg-primary text-white px-8 py-3 text-[10px] uppercase font-bold tracking-widest">Return Home</Link>
    </div>
  );

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen pb-24">
      <div className="flex justify-between items-end mb-12">
        <h1 className="text-4xl font-serif tracking-tight">Inventory Management</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-all"
        >
          {isAdding ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAdd} 
          className="mb-16 p-8 bg-primary/5 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest">Product Name</label>
            <input required className="w-full bg-white p-3 text-sm outline-none border border-primary/10" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest">Brand</label>
            <input required className="w-full bg-white p-3 text-sm outline-none border border-primary/10" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest">Price ($)</label>
            <input required type="number" className="w-full bg-white p-3 text-sm outline-none border border-primary/10" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest">Category</label>
            <select className="w-full bg-white p-3 text-sm outline-none border border-primary/10" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2 col-span-full">
            <label className="text-[10px] uppercase font-bold tracking-widest">Image URL</label>
            <input required className="w-full bg-white p-3 text-sm outline-none border border-primary/10" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
            {newProduct.image && (
              <div className="mt-2 aspect-video bg-white overflow-hidden rounded-sm border border-primary/10">
                <img src={getImageUrl(newProduct.image)} alt="Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="space-y-2 col-span-full">
            <label className="text-[10px] uppercase font-bold tracking-widest">Description</label>
            <textarea className="w-full bg-white p-3 text-sm outline-none border border-primary/10 min-h-[100px]" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={newProduct.isInternational} onChange={e => setNewProduct({...newProduct, isInternational: e.target.checked})} />
            <label className="text-[10px] uppercase font-bold tracking-widest">International Brand?</label>
          </div>
          <div className="md:col-start-2">
            <button type="submit" className="w-full bg-accent text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all">Create Product</button>
          </div>
        </motion.form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-primary/10 text-[10px] uppercase tracking-widest font-bold">
              <th className="py-4 px-2 text-primary/40">Product</th>
              <th className="py-4 px-2 text-primary/40">Brand</th>
              <th className="py-4 px-2 text-primary/40">Category</th>
              <th className="py-4 px-2 text-primary/40">Price</th>
              <th className="py-4 px-2 text-primary/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {products.map(p => (
              <tr key={p.id} className="group hover:bg-primary/5 transition-colors">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <img src={getImageUrl(p.image)} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-sm" alt="" />
                    <span className="font-serif text-lg">{p.name}</span>
                  </div>
                </td>
                <td className="py-4 px-2 text-sm text-primary/60">{p.brand}</td>
                <td className="py-4 px-2 text-sm">
                  <span className="px-2 py-1 bg-paper border border-primary/10 text-[9px] uppercase tracking-widest font-bold rounded-sm">{p.category}</span>
                </td>
                <td className="py-4 px-2 font-serif">${p.price}</td>
                <td className="py-4 px-2 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 transition-colors">
                    <X size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Recommendations = ({ preferences }: { preferences: string }) => {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      const userApiKey = localStorage.getItem('GEMINI_API_KEY');
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(userApiKey ? { 'x-gemini-api-key': userApiKey } : {})
          },
          body: JSON.stringify({ preferences, history: "none" })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setRecs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (preferences) fetchRecs();
  }, [preferences]);

  if (loading) return <div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
    {[1, 2, 3].map(i => <div key={i} className="min-w-[200px] h-32 bg-primary/5 rounded-sm" />)}
  </div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recs.map((rec, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 border border-accent/20 bg-paper rounded-sm"
        >
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">{rec.brand}</span>
          <h4 className="font-serif text-lg mb-1">{rec.name}</h4>
          <p className="text-xs text-primary/60 italic">{rec.reason}</p>
        </motion.div>
      ))}
    </div>
  );
};

const ProductDetailsPage = ({ onWishlist, wishlist, products }: { onWishlist: (p: Product) => void, wishlist: Product[], products: Product[] }) => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === id) || products[0];
  const isWishlisted = wishlist.some(w => w.id === product.id);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;
    const q = query(collection(db, 'products', product.id, 'reviews'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [product?.id]);

  if (!product) return <div className="pt-32 px-6 text-center">Product not found.</div>;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      loginWithGoogle();
      return;
    }
    if (!newReview.comment.trim()) return;

    setIsSubmitting(true);
    try {
      const reviewRef = doc(collection(db, 'products', product.id, 'reviews'));
      await setDoc(reviewRef, {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || 'Glow Member',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp(),
      });
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}/reviews`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-primary/5 overflow-hidden rounded-sm">
            <img src={getImageUrl(product.image)} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={product.name} />
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary/40 mb-2">{product.brand}</p>
            <h1 className="text-5xl font-serif leading-tight mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
               <span className="text-2xl font-serif text-accent">${product.price}</span>
               <div className="h-4 w-px bg-primary/10"></div>
               <div className="flex items-center gap-1">
                 <Star size={14} fill="currentColor" />
                 <span className="text-sm font-medium">{product.rating} <span className="opacity-40 text-xs">({product.reviews} reviews)</span></span>
               </div>
            </div>
          </div>

          <p className="text-primary/70 leading-relaxed max-w-md">{product.description}</p>

          <div className="space-y-4 pt-8 border-t border-primary/5">
            <button className="w-full bg-primary text-white py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-accent transition-colors">Add to Bag</button>
            <button 
              onClick={() => onWishlist(product)}
              className={cn(
                "w-full border border-primary/20 py-4 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-all",
                isWishlisted && "bg-accent/10 border-accent text-accent"
              )}
            >
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} /> 
              {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-32">
        <h2 className="text-3xl font-serif mb-12">User Reviews</h2>
        
        {user ? (
          <form onSubmit={handleSubmitReview} className="mb-16 p-8 border border-primary/5 rounded-sm space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest">Write a Review</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button"
                  onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                  className={cn("hover:scale-110 transition-transform", newReview.rating >= star ? "text-accent" : "text-primary/10")}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
            </div>
            <textarea 
              placeholder="Share your experience..."
              className="w-full bg-primary/5 min-h-[120px] p-4 text-sm outline-none rounded-sm border border-transparent focus:border-accent/40 transition-colors"
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            />
            <button 
              disabled={isSubmitting}
              className="bg-primary text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="mb-16 p-8 bg-primary/5 rounded-sm text-center">
            <p className="text-sm opacity-60 mb-4 font-serif italic text-lg">Sign in to share your thoughts with the community.</p>
            <button onClick={() => loginWithGoogle()} className="bg-primary text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold">Sign In</button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
           {reviews.length > 0 ? reviews.map(review => (
             <div key={review.id} className="p-8 bg-primary/5 rounded-sm space-y-4">
                <div className="flex justify-between items-start">
                   <div>
                     <p className="font-bold text-sm">{review.userName}</p>
                     <p className="text-[10px] text-primary/40">Verified Buyer</p>
                   </div>
                   <div className="flex gap-1 text-accent">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-primary/10" : ""} />
                     ))}
                   </div>
                </div>
                <p className="text-sm opacity-70 italic">"{review.comment}"</p>
             </div>
           )) : (
             <p className="col-span-full text-center text-primary/30 py-12 font-serif italic text-xl">No reviews yet. Be the first to glow.</p>
           )}
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="mt-32 pt-24 border-t border-primary/10">
         <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.4em] text-accent font-bold mb-2 block">Because you liked this</span>
            <h2 className="text-4xl font-serif italic">Aura Intelligence Suggestions</h2>
         </div>
         <Recommendations preferences={`${product.category}, ${product.brand}`} />
      </section>
    </div>
  );
};

const ShopPage = ({ onWishlist, wishlist, products }: { onWishlist: (p: Product) => void, wishlist: Product[], products: Product[] }) => {
  const [filter, setFilter] = useState({ category: 'All', brand: 'All' });
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesCat = filter.category === 'All' || p.category === filter.category;
    const matchesBrand = filter.brand === 'All' || p.brand === filter.brand;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesBrand && matchesSearch;
  });

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen pb-24">
       <div className="mb-16 text-center space-y-4">
          <h1 className="text-6xl font-serif">The Aura <span className="italic">Collection</span></h1>
          <p className="text-primary/50 text-sm max-w-lg mx-auto">Explore our curated selection of high-performance beauty rituals from across the globe and our own backyard.</p>
       </div>

       <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="md:w-64 space-y-12 shrink-0">
             <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search beauty..." 
                    className="w-full bg-primary/5 rounded-sm py-3 pl-10 pr-4 text-sm outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
             </div>

             <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-widest font-bold border-b border-primary/10 pb-2">Category</h4>
                <div className="flex flex-wrap md:flex-col gap-2">
                   {['All', ...CATEGORIES].map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setFilter(f => ({ ...f, category: cat }))}
                       className={cn("text-left text-sm py-1 font-medium transition-all", filter.category === cat ? "text-accent translate-x-2" : "text-primary/50 hover:text-primary")}
                     >{cat}</button>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-widest font-bold border-b border-primary/10 pb-2">Brands</h4>
                <div className="flex flex-wrap md:flex-col gap-2">
                   {['All', ...BRANDS.International, ...BRANDS.Local].map(brand => (
                     <button 
                       key={brand} 
                       onClick={() => setFilter(f => ({ ...f, brand: brand }))}
                       className={cn("text-left text-sm py-1 font-medium transition-all", filter.brand === brand ? "text-accent translate-x-2" : "text-primary/50 hover:text-primary")}
                     >{brand}</button>
                   ))}
                </div>
             </div>
          </div>

          <div className="flex-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onWishlist={onWishlist} isWishlisted={wishlist.some(w => w.id === product.id)} />
                ))}
             </div>
             {filteredProducts.length === 0 && (
               <div className="py-24 text-center">
                  <p className="text-xl font-serif text-primary/30">No products match your current filtering.</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};


const BrandsPage = () => {
  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-6xl font-serif mb-16 text-center leading-tight">Maison of Glow <br /> <span className="italic text-accent">Our Brands</span></h1>
      
      <div className="space-y-24 pb-24">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px flex-1 bg-primary/10"></span>
            <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-primary/40">International Icons</h2>
            <span className="h-px flex-1 bg-primary/10"></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {BRANDS.International.map(brand => (
              <div key={brand} className="group py-6 border-b border-primary/5 flex items-center justify-between cursor-pointer">
                <span className="text-3xl font-serif group-hover:text-accent transition-colors">{brand}</span>
                <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" size={20} />
              </div>
            ))}
          </div>
        </div>

        <div>
           <div className="flex items-center gap-4 mb-8">
            <span className="h-px flex-1 bg-primary/10"></span>
            <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-accent">Local Artisans</h2>
            <span className="h-px flex-1 bg-primary/10"></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {BRANDS.Local.map(brand => (
              <div key={brand} className="group py-6 border-b border-primary/5 flex items-center justify-between cursor-pointer">
                <span className="text-3xl font-serif group-hover:text-accent transition-colors italic">{brand}</span>
                <ArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-accent" size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = ({ wishlist, onRemove }: { wishlist: Product[], onRemove: (p: Product) => void }) => {
  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen pb-24">
       <div className="flex items-center justify-between mb-16 border-b border-primary/10 pb-8">
          <h1 className="text-5xl font-serif">Your Curated <span className="italic text-accent">Loves</span></h1>
          <p className="text-xs uppercase tracking-widest font-bold text-primary/40">{wishlist.length} Items</p>
       </div>
       
       {wishlist.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-24 space-y-8 bg-primary/5 rounded-sm">
            <Heart size={48} strokeWidth={1} className="text-primary/20" />
            <div className="text-center">
              <p className="text-xl font-serif mb-2">No items here yet.</p>
              <p className="text-primary/50">Your future favorites are waiting in the shop.</p>
            </div>
            <Link to="/shop" className="bg-primary text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold">Discover Beauty</Link>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.map(product => (
              <div key={product.id} className="group space-y-4">
                 <div className="aspect-[3/4] overflow-hidden rounded-sm relative">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                    <button 
                      onClick={() => onRemove(product)}
                      className="absolute top-0 right-0 p-4 text-primary bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase tracking-tighter text-primary/40 font-bold">{product.brand}</p>
                    <h3 className="font-serif text-lg">{product.name}</h3>
                    <p className="font-serif text-accent">${product.price}</p>
                 </div>
                 <button className="w-full border border-primary py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-primary hover:text-white transition-all">Add to Bag</button>
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

const HomePage = ({ onWishlist, wishlist, products }: { onWishlist: (p: Product) => void, wishlist: Product[], products: Product[] }) => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Hero Beauty"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper/80 via-paper/40 to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="text-xs uppercase tracking-[0.3em] font-medium text-primary/60 mb-4 block">New Collective 2024</span>
            <h1 className="text-7xl md:text-8xl font-serif leading-[0.9] text-primary mb-8">
              The Bloom of <br /> <span className="italic text-accent">Natural</span> Beauty
            </h1>
            <p className="text-lg text-primary/70 mb-10 max-w-lg leading-relaxed">
              Curating the world's most luxurious international icons and the soul-stirring glow of local botanical craft.
            </p>
            <div className="flex gap-4">
              <Link to="/shop" className="bg-primary text-white px-8 py-4 text-xs uppercase tracking-widest font-medium hover:bg-accent transition-colors flex items-center gap-3">
                Shop The Collection <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-serif">Shop by Category</h2>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
            View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div 
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group aspect-square bg-primary/5 flex items-center justify-center border border-transparent hover:border-accent/40 transition-all rounded-sm cursor-pointer"
            >
              <span className="uppercase tracking-widest text-xs font-semibold group-hover:text-accent group-hover:scale-110 transition-all">{cat}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trends Section - Dynamic AI Concept */}
      <section className="bg-primary text-white py-24 overflow-hidden relative">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -left-12 w-32 h-32 border border-white/10 rounded-full flex items-center justify-center text-[10px] uppercase tracking-tighter"
            >
              <div className="flex items-center gap-1"><Sparkles size={12} /> AI Powered Recs</div>
            </motion.div>
            <img 
              src="https://images.unsplash.com/photo-1596462502278-27bf8637391f?q=80&w=1000&auto=format&fit=crop" 
              className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700 aspect-[4/5] object-cover"
              alt="AI Beauty"
            />
          </div>
          <div>
            <h2 className="text-5xl font-serif leading-tight mb-8">Personalized <br /> <span className="italic text-accent">Glow Rituals</span></h2>
            <p className="text-lg opacity-70 mb-12 leading-relaxed">
              Our Aura Intelligence analyzes your skin preferences, local climate, and style history to suggest the perfect palette. 
              Always authenticated, always you.
            </p>
            <div className="space-y-6">
              <div className="p-6 border border-white/20 rounded-sm hover:border-accent hover:bg-white/5 transition-all group cursor-pointer">
                <h4 className="text-xl font-serif mb-2 group-hover:text-accent transition-colors">Complete Aura Profile</h4>
                <p className="text-sm opacity-60">Unlock recommendations customized to your unique undertones.</p>
              </div>
              <div className="p-6 border border-white/20 rounded-sm hover:border-accent hover:bg-white/5 transition-all group cursor-pointer">
                <h4 className="text-xl font-serif mb-2 group-hover:text-accent transition-colors">Climate Adaptive Kit</h4>
                <p className="text-sm opacity-60">Products that work with your local humidity and UV index.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div className="space-y-2">
             <span className="text-xs uppercase tracking-widest text-accent font-bold">The Catalog</span>
             <h2 className="text-5xl font-serif">Curated for You</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.slice(0, 3).map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onWishlist={onWishlist}
              isWishlisted={wishlist.some(w => w.id === product.id)}
            />
          ))}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="py-24 bg-soft-gold/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-serif text-center mb-16 underline decoration-accent decoration-1 underline-offset-[12px]">The Beauty Journal</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {BLOG_POSTS.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-6">
                 <div className="aspect-video overflow-hidden rounded-sm relative">
                    <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title} />
                    <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 text-[10px] uppercase font-bold tracking-widest">{post.category}</span>
                 </div>
                 <div className="space-y-3">
                   <h3 className="text-3xl font-serif leading-tight group-hover:text-accent transition-colors">{post.title}</h3>
                   <p className="text-primary/70 line-clamp-2">{post.excerpt}</p>
                   <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-primary/20 pb-1">
                     Read Story <ChevronRight size={14} />
                   </span>
                 </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Main App Logic ---

export default function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Fetch all products from Firestore
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllProducts(snapshot.docs.map(doc => ({ ...doc.data() } as Product)));
    });
    return () => unsubscribe();
  }, []);

  // Sync Wishlist from Firestore
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'wishlist'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wishlistedIds = snapshot.docs.map(doc => doc.id);
      const items = allProducts.filter(p => wishlistedIds.includes(p.id));
      setWishlist(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/wishlist`);
    });

    return () => unsubscribe();
  }, [user, allProducts]);

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      loginWithGoogle();
      return;
    }

    const itemRef = doc(db, 'users', user.uid, 'wishlist', product.id);
    const existing = wishlist.find(p => p.id === product.id);

    try {
      if (existing) {
        await deleteDoc(itemRef);
      } else {
        await setDoc(itemRef, {
          productId: product.id,
          addedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, existing ? OperationType.DELETE : OperationType.WRITE, itemRef.path);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <ScrollToTop />
          <Navbar wishlistCount={wishlist.length} cartCount={cart.length} />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage onWishlist={toggleWishlist} wishlist={wishlist} products={allProducts} />} />
              <Route path="/shop" element={<ShopPage onWishlist={toggleWishlist} wishlist={wishlist} products={allProducts} />} />
              <Route path="/product/:id" element={<ProductDetailsPage onWishlist={toggleWishlist} wishlist={wishlist} products={allProducts} />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/wishlist" element={<WishlistPage wishlist={wishlist} onRemove={toggleWishlist} />} />
              <Route path="/blog" element={<HomePage onWishlist={toggleWishlist} wishlist={wishlist} products={allProducts} />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

        <footer className="bg-primary text-white py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link to="/" className="text-4xl font-serif tracking-tighter">Aura Glow</Link>
              <p className="max-w-xs text-white/50 leading-relaxed font-light">
                Redefining beauty standards through a curated experience of global luxury and local heart.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-primary transition-all cursor-pointer">
                  <User size={18} />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-accent">Quick Links</h4>
              <ul className="space-y-4 text-sm text-white/60">
                <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
                <li><Link to="/brands" className="hover:text-white transition-colors">Our Brands</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">The Journal</Link></li>
                <li><Link to="/account" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-accent">Newsletter</h4>
              <p className="text-sm text-white/60">Unlock early access to the local glow.</p>
              <div className="relative border-b border-white/20 pb-2">
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  className="bg-transparent w-full text-xs placeholder:text-white/30 outline-none uppercase tracking-widest"
                />
                <button className="absolute right-0 top-0"><ArrowRight size={16} /></button>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-white/30">
            <p>&copy; 2024 Aura Glow Beauty. All Rights Reserved.</p>
            <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

