import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LabCard from './LabCard';
import TestCard from './TestCard';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';
import './PatientPages.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularTests, setPopularTests] = useState([]);
  const [realTests, setRealTests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Load nearby labs, popular tests and bookable tests
  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const [labsRes, popularRes, testsRes] = await Promise.all([
          api.get('/api/discovery/labs'),
          api.get('/api/discovery/popular-tests'),
          api.get('/api/discovery/tests'),
        ]);
        setLabs(labsRes.data);
        setPopularTests(popularRes.data);
        setRealTests(testsRes.data);
      } catch (err) {
        console.error('Error loading home feed:', err);
        toast.error('Failed to load home feed.');
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const getPlaceholderText = () => {
    if (activeTab === 'packages') return 'Search health packages (e.g. Master Full Body, Cardiac Wellness, Diabetic)';
    if (activeTab === 'labs') return 'Search accredited diagnostic centers (e.g. MediPath, Quest, LabCorp)';
    if (activeTab === 'radiology') return 'Search scans & imaging (e.g. Brain MRI, Chest X-Ray, Abdomen CT)';
    return 'Search 1,200+ tests (e.g. Lipid Profile, CBC, Vitamin D3, HbA1c)';
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patient/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/patient/search');
    }
  };

  const showCartToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3600);
  };

  const handleBookPackage = (pkgName, price, paramCount) => {
    const packageItem = {
      id: `pkg-${pkgName.toLowerCase().replace(/\s+/g, '-')}`,
      name: pkgName,
      code: 'PKG',
      price: price,
      sample_type: 'Blood & Urine',
      description: `${paramCount} Medical Biomarkers + Free Home Sample Collection`,
      turnaround_hours: 12
    };
    addToCart(packageItem);
    showCartToast(`Added ${pkgName} ($${price}) to your diagnostic order`);
  };

  const handleSelectLabItem = (labName, price) => {
    const labItem = {
      id: `labtest-${labName.toLowerCase().replace(/\s+/g, '-')}`,
      name: `Full Body Panel @ ${labName}`,
      code: 'LAB-TEST',
      price: price,
      sample_type: 'Blood',
      description: `Complete diagnostic panel at ${labName} with NABL certified report`,
      turnaround_hours: 8
    };
    addToCart(labItem);
    showCartToast(`Added ${labName} booking ($${price}) to your diagnostic order`);
  };

  const categories = [
    { name: 'Full Health Packages', count: '34 Packages', icon: 'health_and_safety', query: 'package' },
    { name: 'Routine Blood Work', count: '180+ Tests', icon: 'bloodtype', query: 'blood' },
    { name: 'Radiology & MRI', count: 'X-Ray, CT, Scan', icon: 'radiology', query: 'radiology' },
    { name: 'Diabetes & Metabolic', count: 'Fast HbA1c', icon: 'monitor_heart', query: 'diabetes' },
    { name: 'Women\'s Fertility', count: 'Hormone Panels', icon: 'female', query: 'women' },
    { name: 'Senior Citizen Care', count: 'Geriatric Panels', icon: 'elderly', query: 'senior' },
    { name: 'Cancer Screening', count: 'Biopsy & Markers', icon: 'biotech', query: 'cancer' },
  ];

  return (
    <div className="w-full bg-surface min-h-screen text-on-surface animate-fade-in">
      {/* Toast Notification Micro-interaction */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 bg-inverse-surface text-inverse-on-surface px-lg py-sm rounded-xl shadow-xl flex items-center gap-sm">
          <span className="material-symbols-outlined text-secondary-fixed text-[24px]">verified</span>
          <span className="font-body-sm text-body-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HERO SECTION: Guided Confidence Hub */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-background pt-8 pb-16">
        {/* Ambient organic medical glow circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondary-fixed/25 blur-3xl pointer-events-none"></div>
        <div className="absolute top-12 -right-24 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-[1200px] mx-auto px-lg relative z-10 flex flex-col items-center text-center">
          {/* Accreditations Pill */}
          <div className="inline-flex items-center gap-xs px-sm py-base rounded-full bg-surface-container-lowest text-primary shadow-sm mb-md border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label-md text-label-md tracking-wider uppercase font-bold text-secondary">Verified Clinical Network</span>
            <span className="text-outline-variant">•</span>
            <span className="font-body-sm text-[12px] text-on-surface-variant font-medium">Over 240+ CAP & NABL Accredited Hubs</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display-lg text-display-lg max-w-4xl text-on-surface tracking-tight mb-sm">
            Accurate Lab Tests, Delivered to Your Doorstep or Near You
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-xl">
            Compare verified NABL-accredited diagnostic labs, get 100% accurate digital reports within 6–24 hours, and enjoy zero-cost home sample collection by certified phlebotomists.
          </p>

          {/* Search & Booking Card (Bento Masterpiece) */}
          <div className="w-full max-w-4xl bg-surface-container-lowest rounded-2xl shadow-xl p-md sm:p-lg flex flex-col gap-md text-left border border-outline-variant/20">
            {/* Search Category Selector Tabs */}
            <div className="flex items-center gap-xs overflow-x-auto pb-xs">
              {[
                { id: 'all', label: 'All Tests' },
                { id: 'packages', label: 'Health Checkups' },
                { id: 'labs', label: 'Partner Labs' },
                { id: 'radiology', label: 'Radiology & Scans' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-md py-xs rounded-lg font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-on-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-stretch gap-sm bg-surface-container-low p-xs rounded-xl">
              {/* Text Search Field */}
              <div className="flex-1 flex items-center gap-xs px-sm py-xs bg-surface-container-lowest rounded-lg border border-outline-variant/30 focus-within:border-primary">
                <span className="material-symbols-outlined text-primary text-[22px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getPlaceholderText()}
                  className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                />
              </div>

              {/* Location Picker Dropdown Simulation */}
              <div 
                onClick={() => navigate('/patient/profile')}
                className="flex items-center justify-between gap-sm px-sm py-xs bg-surface-container-lowest rounded-lg cursor-pointer min-w-[220px] hover:bg-surface-container transition-colors border border-outline-variant/30"
              >
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-[10px] text-on-surface-variant leading-none uppercase">Location</span>
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">Downtown, New York</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[18px]">keyboard_arrow_down</span>
              </div>

              {/* Action CTA */}
              <button
                type="submit"
                className="px-lg py-sm bg-primary hover:bg-primary-container text-on-primary rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Find Labs & Tests</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>

            {/* Quick Trending Pills */}
            <div className="flex flex-wrap items-center gap-xs pt-xs">
              <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold mr-xs flex items-center gap-base">
                <span className="material-symbols-outlined text-secondary text-[16px]">trending_up</span> Popular:
              </span>
              <button
                type="button"
                onClick={() => navigate('/patient/search?q=Full%20Body')}
                className="px-sm py-base rounded-full bg-secondary-fixed/40 text-on-secondary-container hover:bg-secondary-fixed font-body-sm text-[12px] font-semibold transition-colors flex items-center gap-base cursor-pointer"
              >
                <span>Full Body 80+ Tests</span>
                <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">50% Off</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient/search?q=Thyroid')}
                className="px-sm py-base rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors cursor-pointer"
              >
                Thyroid Profile (T3, T4, TSH)
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient/search?q=Diabetes')}
                className="px-sm py-base rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors cursor-pointer"
              >
                Diabetes Care (HbA1c)
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient/search?q=RT-PCR')}
                className="px-sm py-base rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors cursor-pointer"
              >
                RT-PCR
              </button>
              <button
                type="button"
                onClick={() => navigate('/patient/search?q=Allergy')}
                className="px-sm py-base rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] transition-colors cursor-pointer"
              >
                Food Allergy Panel
              </button>
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-md mt-xl pt-lg">
            <div className="flex items-center gap-sm p-sm rounded-xl bg-surface-container-lowest/60 shadow-sm backdrop-blur-sm border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">hotel_class</span>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-base">
                  <span className="font-title-md text-title-md font-bold text-on-surface">4.9/5</span>
                  <span className="material-symbols-outlined text-[14px] text-amber-500 fill-current">star</span>
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant">120k+ Verified Reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-sm p-sm rounded-xl bg-surface-container-lowest/60 shadow-sm backdrop-blur-sm border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-title-md text-title-md font-bold text-on-surface">100%</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">NABL & CAP Accredited</span>
              </div>
            </div>

            <div className="flex items-center gap-sm p-sm rounded-xl bg-surface-container-lowest/60 shadow-sm backdrop-blur-sm border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">timer</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-title-md text-title-md font-bold text-on-surface">60 Mins</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">Home Phlebotomist Arrival</span>
              </div>
            </div>

            <div className="flex items-center gap-sm p-sm rounded-xl bg-surface-container-lowest/60 shadow-sm backdrop-blur-sm border border-outline-variant/20">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[24px]">encrypted</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-title-md text-title-md font-bold text-on-surface">256-Bit</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">Secure Digital Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORY EXPLORATION */}
      <section className="w-full max-w-[1200px] mx-auto px-lg py-xl">
        <div className="flex items-end justify-between mb-lg">
          <div>
            <div className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-base font-semibold">Precision Diagnostics</div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Explore by Health Specialty</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/patient/search')}
            className="hidden sm:inline-flex items-center gap-xs font-label-md text-label-md text-primary hover:text-primary-container font-semibold transition-colors cursor-pointer"
          >
            <span>View all 42 diagnostic fields</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Category Grid with rich iconography */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-sm">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(`/patient/search?q=${encodeURIComponent(cat.query)}`)}
              className="group p-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-low shadow-sm hover:shadow transition-all duration-200 flex flex-col items-center text-center border border-outline-variant/20 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-full ${idx % 2 === 0 ? 'bg-surface-container-highest text-primary' : 'bg-secondary-fixed/50 text-secondary'} flex items-center justify-center group-hover:scale-110 transition-transform mb-sm`}>
                <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
              </div>
              <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-snug">{cat.name}</span>
              <span className="font-label-md text-[11px] text-secondary mt-base">{cat.count}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED HEALTH CHECKUP PACKAGES SECTION */}
      <section className="w-full bg-surface-container-low py-xl border-y border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto px-lg">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-lg gap-sm">
            <div>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Clinically Tailored Care</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mt-base">Featured Health Checkup Packages</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Curated preventive profiles validated by our internal panel of pathologists.</p>
            </div>
            <div className="flex items-center gap-xs">
              <span className="font-body-sm text-[13px] text-on-surface-variant font-medium">All packages include:</span>
              <span className="inline-flex items-center gap-base px-sm py-base rounded-full bg-surface-container-lowest text-secondary font-label-md text-[11px] shadow-sm border border-outline-variant/20 font-semibold">
                <span className="material-symbols-outlined text-[16px]">home</span> Free Home Pickup
              </span>
            </div>
          </div>

          {/* Packages 3-Col Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* CARD 1: Comprehensive Full Body Checkup */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group border border-outline-variant/30">
              <div className="h-2 w-full bg-secondary"></div>
              <div className="p-lg flex flex-col flex-1">
                <div className="flex items-center justify-between gap-xs mb-sm">
                  <span className="px-sm py-base rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md uppercase tracking-wider font-bold">BESTSELLER</span>
                  <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                    <span className="text-on-surface font-bold">4.95</span>
                    <span className="text-outline text-[11px]">(3,420)</span>
                  </div>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-xs group-hover:text-primary transition-colors">
                  Comprehensive Full Body Checkup
                </h3>
                <div className="inline-flex items-center gap-xs text-primary font-label-md text-label-md font-semibold mb-md">
                  <span className="material-symbols-outlined text-[18px]">lab_profile</span>
                  <span>84 Medical Parameters</span>
                </div>
                <div className="space-y-xs mb-md flex-1">
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Liver Function:</strong> 11 tests (SGOT, SGPT, Bilirubin)</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Kidney Profile:</strong> 6 tests (Creatinine, Urea)</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Lipid & Heart:</strong> 8 tests (Cholesterol, HDL)</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Vitamins & Blood:</strong> Vitamin D3, B12, Iron, CBC</span>
                  </div>
                </div>
                <div className="p-xs px-sm rounded-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-body-sm text-[12px] mb-md">
                  <span className="flex items-center gap-base">
                    <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span> Report in 12h
                  </span>
                  <span className="flex items-center gap-base">
                    <span className="material-symbols-outlined text-primary text-[16px]">person</span> Free Phlebotomy
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-sm">
                  <div className="flex items-baseline gap-xs">
                    <span className="font-display-lg text-[28px] font-bold text-primary leading-none">$79</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">$180</span>
                  </div>
                  <span className="px-sm py-base rounded-md bg-error-container text-on-error-container font-label-md text-[11px] font-bold">56% OFF</span>
                </div>
              </div>
              <div className="p-md pt-0 grid grid-cols-2 gap-xs">
                <button
                  type="button"
                  onClick={() => handleBookPackage('Comprehensive Full Body Checkup', 79, 84)}
                  className="w-full py-xs px-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md text-center transition-colors shadow-sm cursor-pointer"
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/patient/search?q=full%20body')}
                  className="w-full py-xs px-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md text-center transition-colors cursor-pointer"
                >
                  Compare Labs
                </button>
              </div>
            </div>

            {/* CARD 2: Advanced Heart & Cardiac Risk Profile */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group border border-outline-variant/30">
              <div className="h-2 w-full bg-primary"></div>
              <div className="p-lg flex flex-col flex-1">
                <div className="flex items-center justify-between gap-xs mb-sm">
                  <span className="px-sm py-base rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md uppercase tracking-wider font-bold">DOCTOR RECOMMENDED</span>
                  <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                    <span className="text-on-surface font-bold">4.92</span>
                    <span className="text-outline text-[11px]">(1,840)</span>
                  </div>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-xs group-hover:text-primary transition-colors">
                  Advanced Heart & Cardiac Risk Profile
                </h3>
                <div className="inline-flex items-center gap-xs text-primary font-label-md text-label-md font-semibold mb-md">
                  <span className="material-symbols-outlined text-[18px]">cardiology</span>
                  <span>28 Critical Cardiac Markers</span>
                </div>
                <div className="space-y-xs mb-md flex-1">
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Lipid Panel Extended:</strong> HDL, LDL, VLDL Ratio</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Inflammation:</strong> High Sensitivity hs-CRP Cardiac</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Vascular Risk:</strong> Apolipoprotein A1 & B</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Myocardial:</strong> Cardiac Enzymes + Electrolytes</span>
                  </div>
                </div>
                <div className="p-xs px-sm rounded-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-body-sm text-[12px] mb-md">
                  <span className="flex items-center gap-base">
                    <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span> Report in 8h (Express)
                  </span>
                  <span className="flex items-center gap-base">
                    <span className="material-symbols-outlined text-primary text-[16px]">person</span> Free Phlebotomy
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-sm">
                  <div className="flex items-baseline gap-xs">
                    <span className="font-display-lg text-[28px] font-bold text-primary leading-none">$65</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">$140</span>
                  </div>
                  <span className="px-sm py-base rounded-md bg-error-container text-on-error-container font-label-md text-[11px] font-bold">54% OFF</span>
                </div>
              </div>
              <div className="p-md pt-0 grid grid-cols-2 gap-xs">
                <button
                  type="button"
                  onClick={() => handleBookPackage('Advanced Heart & Cardiac Risk Profile', 65, 28)}
                  className="w-full py-xs px-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md text-center transition-colors shadow-sm cursor-pointer"
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/patient/search?q=cardiac')}
                  className="w-full py-xs px-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md text-center transition-colors cursor-pointer"
                >
                  Compare Labs
                </button>
              </div>
            </div>

            {/* CARD 3: Executive Women Wellness Screen */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group border border-outline-variant/30">
              <div className="h-2 w-full bg-tertiary"></div>
              <div className="p-lg flex flex-col flex-1">
                <div className="flex items-center justify-between gap-xs mb-sm">
                  <span className="px-sm py-base rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md uppercase tracking-wider font-bold">MOST POPULAR</span>
                  <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                    <span className="text-on-surface font-bold">4.97</span>
                    <span className="text-outline text-[11px]">(2,110)</span>
                  </div>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-xs group-hover:text-primary transition-colors">
                  Executive Women Wellness Screen
                </h3>
                <div className="inline-flex items-center gap-xs text-primary font-label-md text-label-md font-semibold mb-md">
                  <span className="material-symbols-outlined text-[18px]">female</span>
                  <span>72 Comprehensive Biomarkers</span>
                </div>
                <div className="space-y-xs mb-md flex-1">
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Hormone Profile:</strong> FSH, LH, Prolactin, Estradiol</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Bone & Joint:</strong> Calcium, Phosphorous, Vitamin D</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Metabolic Screen:</strong> HbA1c, Average Glucose</span>
                  </div>
                  <div className="flex items-start gap-xs font-body-sm text-[13px] text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">check_circle</span>
                    <span><strong>Thyroid Complete:</strong> TSH, Free T3, Free T4</span>
                  </div>
                </div>
                <div className="p-xs px-sm rounded-lg bg-surface-container-low flex items-center justify-between text-on-surface-variant font-body-sm text-[12px] mb-md">
                  <span className="flex items-center gap-base">
                    <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span> Report in 14h
                  </span>
                  <span className="flex items-center gap-base">
                    <span className="material-symbols-outlined text-primary text-[16px]">person</span> Free Phlebotomy
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-sm">
                  <div className="flex items-baseline gap-xs">
                    <span className="font-display-lg text-[28px] font-bold text-primary leading-none">$85</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">$165</span>
                  </div>
                  <span className="px-sm py-base rounded-md bg-error-container text-on-error-container font-label-md text-[11px] font-bold">48% OFF</span>
                </div>
              </div>
              <div className="p-md pt-0 grid grid-cols-2 gap-xs">
                <button
                  type="button"
                  onClick={() => handleBookPackage('Executive Women Wellness Screen', 85, 72)}
                  className="w-full py-xs px-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md text-center transition-colors shadow-sm cursor-pointer"
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/patient/search?q=women')}
                  className="w-full py-xs px-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md text-center transition-colors cursor-pointer"
                >
                  Compare Labs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REAL-TIME DIAGNOSTIC LAB COMPARISON SPOTLIGHT */}
      <section className="w-full max-w-[1200px] mx-auto px-lg py-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-lg gap-sm">
          <div>
            <div className="inline-flex items-center gap-xs px-sm py-base rounded-full bg-secondary-fixed/30 text-secondary font-label-md text-label-md uppercase tracking-wider font-semibold mb-xs">
              <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
              <span>Transparent Marketplace Matrix</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Compare Prices & Turnaround Times Across Top Labs</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-base">
              Live benchmarking for: <strong className="text-on-surface font-semibold">"Complete Blood Count (CBC) & Comprehensive Metabolic Panel"</strong>
            </p>
          </div>
          {/* Quick sort filter pills */}
          <div className="flex items-center gap-xs bg-surface-container-low p-xs rounded-xl self-start lg:self-auto border border-outline-variant/20">
            <span className="font-label-md text-label-md text-on-surface-variant px-sm">Sort By:</span>
            <button type="button" className="px-sm py-base bg-surface-container-lowest text-primary rounded-lg font-label-md text-[12px] font-bold shadow-sm cursor-pointer">Fastest Report</button>
            <button type="button" className="px-sm py-base hover:bg-surface-container text-on-surface-variant rounded-lg font-label-md text-[12px] transition-colors cursor-pointer">Lowest Price</button>
            <button type="button" className="px-sm py-base hover:bg-surface-container text-on-surface-variant rounded-lg font-label-md text-[12px] transition-colors cursor-pointer">Closest Lab</button>
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {/* Lab 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-start justify-between gap-xs mb-xs">
                <span className="px-sm py-base bg-surface-container text-primary rounded-md font-label-md text-[10px] uppercase font-bold tracking-wider">Accredited Hub</span>
                <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                  <span className="text-on-surface font-bold">4.8</span>
                </div>
              </div>
              <h4 className="font-title-md text-[18px] text-on-surface font-semibold">MediPath Diagnostics</h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-base mt-base">
                <span className="material-symbols-outlined text-outline text-[14px]">near_me</span> 1.8 miles away • Downtown Suite
              </p>
              <div className="mt-md space-y-xs pt-xs border-t border-outline-variant/10">
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Turnaround:</span>
                  <span className="font-semibold text-on-surface flex items-center gap-base">
                    <span className="material-symbols-outlined text-secondary text-[16px]">speed</span> 6 Hours
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Home Pickup:</span>
                  <span className="font-semibold text-secondary">Free ($0)</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Accreditations:</span>
                  <span className="font-semibold text-on-surface">CAP & NABL</span>
                </div>
              </div>
            </div>
            <div className="pt-md mt-md flex items-center justify-between border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-label-md text-[10px] uppercase text-outline">Total Package</span>
                <span className="font-price-display text-price-display text-primary">$39</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectLabItem('MediPath Diagnostics', 39)}
                className="px-md py-xs rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              >
                Select Lab
              </button>
            </div>
          </div>

          {/* Lab 2 (Fastest) */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-md hover:shadow-xl transition-all relative flex flex-col justify-between border border-secondary/30">
            <div className="absolute -top-3 left-4 px-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-base">
              <span className="material-symbols-outlined text-[14px]">bolt</span> Fastest Delivery
            </div>
            <div>
              <div className="flex items-start justify-between gap-xs mb-xs pt-base">
                <span className="px-sm py-base bg-secondary-fixed/50 text-secondary rounded-md font-label-md text-[10px] uppercase font-bold tracking-wider">Priority Slot</span>
                <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                  <span className="text-on-surface font-bold">4.9</span>
                </div>
              </div>
              <h4 className="font-title-md text-[18px] text-on-surface font-semibold">SwiftLab Express</h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-base mt-base">
                <span className="material-symbols-outlined text-outline text-[14px]">near_me</span> 2.4 miles away • Medical Center
              </p>
              <div className="mt-md space-y-xs pt-xs border-t border-outline-variant/10">
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Turnaround:</span>
                  <span className="font-bold text-secondary flex items-center gap-base">
                    <span className="material-symbols-outlined text-[16px]">bolt</span> 4 Hours Flat
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Home Pickup:</span>
                  <span className="font-semibold text-on-surface">$10 (Express)</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Accreditations:</span>
                  <span className="font-semibold text-on-surface">ISO 15189, CAP</span>
                </div>
              </div>
            </div>
            <div className="pt-md mt-md flex items-center justify-between border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-label-md text-[10px] uppercase text-outline">Total Package</span>
                <span className="font-price-display text-price-display text-primary">$45</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectLabItem('SwiftLab Express', 45)}
                className="px-md py-xs rounded-lg bg-secondary hover:bg-on-secondary-fixed-variant text-on-secondary font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              >
                Select Lab
              </button>
            </div>
          </div>

          {/* Lab 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-start justify-between gap-xs mb-xs">
                <span className="px-sm py-base bg-surface-container text-primary rounded-md font-label-md text-[10px] uppercase font-bold tracking-wider">Hospital Lab</span>
                <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                  <span className="text-on-surface font-bold">4.9</span>
                </div>
              </div>
              <h4 className="font-title-md text-[18px] text-on-surface font-semibold">Apollo Clinical Labs</h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-base mt-base">
                <span className="material-symbols-outlined text-outline text-[14px]">near_me</span> 3.1 miles away • Central Campus
              </p>
              <div className="mt-md space-y-xs pt-xs border-t border-outline-variant/10">
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Turnaround:</span>
                  <span className="font-semibold text-on-surface flex items-center gap-base">
                    <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span> 12 Hours
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Home Pickup:</span>
                  <span className="font-semibold text-secondary">Free ($0)</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Accreditations:</span>
                  <span className="font-semibold text-on-surface">JCI & CAP Certified</span>
                </div>
              </div>
            </div>
            <div className="pt-md mt-md flex items-center justify-between border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-label-md text-[10px] uppercase text-outline">Total Package</span>
                <span className="font-price-display text-price-display text-primary">$42</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectLabItem('Apollo Clinical Labs', 42)}
                className="px-md py-xs rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              >
                Select Lab
              </button>
            </div>
          </div>

          {/* Lab 4 */}
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="flex items-start justify-between gap-xs mb-xs">
                <span className="px-sm py-base bg-secondary-fixed/40 text-on-secondary-fixed rounded-md font-label-md text-[10px] uppercase font-bold tracking-wider">Best Value</span>
                <div className="flex items-center gap-base text-amber-500 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                  <span className="text-on-surface font-bold">4.7</span>
                </div>
              </div>
              <h4 className="font-title-md text-[18px] text-on-surface font-semibold">LifePath Medical Center</h4>
              <p className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-base mt-base">
                <span className="material-symbols-outlined text-outline text-[14px]">near_me</span> 0.8 miles away • West End
              </p>
              <div className="mt-md space-y-xs pt-xs border-t border-outline-variant/10">
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Turnaround:</span>
                  <span className="font-semibold text-on-surface flex items-center gap-base">
                    <span className="material-symbols-outlined text-secondary text-[16px]">schedule</span> 18 Hours
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Home Pickup:</span>
                  <span className="font-semibold text-on-surface">Cash on Pickup</span>
                </div>
                <div className="flex items-center justify-between text-body-sm text-[13px]">
                  <span className="text-on-surface-variant">Accreditations:</span>
                  <span className="font-semibold text-on-surface">NABL Certified</span>
                </div>
              </div>
            </div>
            <div className="pt-md mt-md flex items-center justify-between border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-label-md text-[10px] uppercase text-outline">Total Package</span>
                <span className="font-price-display text-price-display text-primary">$32</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectLabItem('LifePath Medical Center', 32)}
                className="px-md py-xs rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
              >
                Select Lab
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE RECOMMENDED LABS FROM BACKEND */}
      <section className="w-full max-w-[1200px] mx-auto px-lg py-xl border-t border-outline-variant/20">
        <div className="flex items-center justify-between mb-lg">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Active Diagnostic Partners</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-xs">Recommended Labs Near You</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/patient/search')}
            className="text-primary font-label-md text-label-md font-semibold hover:underline cursor-pointer"
          >
            View All Partner Labs
          </button>
        </div>

        {loading ? (
          <div className="py-xl text-center text-on-surface-variant font-body-lg">
            <span className="material-symbols-outlined text-[32px] animate-spin text-primary block mx-auto mb-xs">progress_activity</span>
            Locating accredited labs near you...
          </div>
        ) : labs.length === 0 ? (
          <div className="p-xl text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <p className="font-body-lg text-on-surface-variant">No active labs are operating in your area right now.</p>
            <p className="font-body-sm text-secondary mt-xs">Check back soon as diagnostic partners complete onboarding.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {labs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
            ))}
          </div>
        )}
      </section>

      {/* BOOK POPULAR HEALTH TESTS FROM BACKEND */}
      {realTests.length > 0 && (
        <section className="w-full bg-surface-container-low py-xl border-t border-outline-variant/20">
          <div className="max-w-[1200px] mx-auto px-lg">
            <div className="flex items-center justify-between mb-lg">
              <div>
                <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Individual Investigations</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-xs">Book Popular Health Tests</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/patient/search')}
                className="text-primary font-label-md text-label-md font-semibold hover:underline cursor-pointer"
              >
                Browse All 1,200+ Tests
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {realTests.slice(0, 6).map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  isAdded={isInCart(test.id)}
                  onAdd={() => addToCart(test, test.lab_id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW DIAGNOSTICHUB / LABEASE WORKS INFOGRAPHIC */}
      <section className="w-full bg-surface-container-low py-xl border-t border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto px-lg">
          <div className="text-center max-w-2xl mx-auto mb-xl">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">End-to-End Clinical Protocol</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-base">How LabEase Works</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">From certified sample handling to verified electronic lab results in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative">
            {/* Connecting Line for desktop */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 bg-surface-container-highest -z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center p-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display-lg text-[24px] font-bold shadow-md mb-md">
                1
              </div>
              <h3 className="font-title-md text-title-md text-on-surface mb-xs">Choose Test or Lab</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Search 1,200+ individual tests, compare accredited providers by price or speed, or upload a handwritten doctor’s prescription for automatic matching.
              </p>
              <div className="mt-md px-sm py-base rounded-full bg-surface-container text-primary font-label-md text-[11px] font-semibold flex items-center gap-base">
                <span className="material-symbols-outlined text-[14px]">tune</span> Instant Quote Compare
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center p-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center font-display-lg text-[24px] font-bold shadow-md mb-md">
                2
              </div>
              <h3 className="font-title-md text-title-md text-on-surface mb-xs">Safe Home Sample Pickup</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                A certified phlebotomist arrives at your preferred time slot equipped with single-use, barcode-tagged, tamper-proof vacuum tubes.
              </p>
              <div className="mt-md px-sm py-base rounded-full bg-secondary-fixed/40 text-on-secondary-container font-label-md text-[11px] font-semibold flex items-center gap-base">
                <span className="material-symbols-outlined text-[14px]">ac_unit</span> Temperature-controlled Transit
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center p-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container text-on-tertiary flex items-center justify-center font-display-lg text-[24px] font-bold shadow-md mb-md">
                3
              </div>
              <h3 className="font-title-md text-title-md text-on-surface mb-xs">Accurate Reports Online</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Receive pathologist-signed digital PDF reports via email, SMS, and secure patient portal with historical trend tracking and doctor consultations.
              </p>
              <div className="mt-md px-sm py-base rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-[11px] font-semibold flex items-center gap-base">
                <span className="material-symbols-outlined text-[14px]">analytics</span> AI Health Trend Analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL ADVISORY BOARD & PATIENT TRUST SECTION */}
      <section className="w-full max-w-[1200px] mx-auto px-lg py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-center">
          {/* Left Column: Medical Board Photo & Credibility Card */}
          <div className="lg:col-span-5 flex flex-col gap-md">
            <div className="rounded-2xl overflow-hidden shadow-lg relative bg-surface-container border border-outline-variant/20">
              <img
                className="w-full h-80 object-cover"
                alt="Chief Pathologist examining diagnostic slides"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2bQrE1_LrxDfJl55zAwgubiGPjCylAV8Rzr-zwJpOrAYDwtxnxrFycE1SaXsAyUHtjH0FFoZgiBp6tiPExsQnhfwIOW_zJyt-yo0Tugx4K4yKM2LKRJE4_j1UhtUdlzgCfNjBSag92-qRIPwhCRSWc5Lnf4egG_B-4KFUhCQXgSAKpa96jEJBKw1Xi2lfV-ifVwZlVHOCRrx6LlDucKiXlvT1dmTuCGiNK5ZjMRiQKo6Ne2sVTbmn"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-on-surface/90 via-on-surface/60 to-transparent p-md text-surface-bright">
                <span className="font-label-md text-[11px] uppercase tracking-wider text-secondary-fixed font-bold">Chief Pathologist & Medical Director</span>
                <h4 className="font-title-md text-title-md font-bold text-white">Dr. Sarah Jenkins, MD, FCAP</h4>
                <p className="font-body-sm text-[12px] text-surface-container-highest">Former Head of Clinical Pathology, Johns Hopkins Medicine Network</p>
              </div>
            </div>

            <div className="p-md rounded-xl bg-surface-container-low flex items-center gap-md border border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shrink-0">
                <span className="material-symbols-outlined text-[28px]">shield_with_heart</span>
              </div>
              <div>
                <div className="font-title-md text-[16px] font-bold text-on-surface">Triple-Verification Protocol</div>
                <p className="font-body-sm text-[12px] text-on-surface-variant">Every high-risk diagnostic report is reviewed by two certified pathologists before final release to your portal.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Patient Testimonials & Trust metrics */}
          <div className="lg:col-span-7 flex flex-col gap-md">
            <div>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">Patient Experience</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mt-base">Trusted by 1.2M+ Patients & 5,000+ Independent Physicians</h2>
            </div>

            {/* Testimonial Quote 1 */}
            <div className="p-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-sm border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-base text-amber-500">
                  <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                  <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                </div>
                <span className="font-label-md text-[11px] text-outline">Verified Patient • 2 days ago</span>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface italic">
                "Getting regular blood panels for diabetes used to mean waiting hours at crowded hospitals. LabEase's phlebotomist was at my front door right at 7:00 AM, pain-free blood draw, and my complete report was on my phone by 3:00 PM. Unbeatable convenience."
              </p>
              <div className="flex items-center gap-sm mt-xs">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  alt="Elena Rodriguez"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYhHDHo8ak_EWGDgx_bKh0yGfIrJ7SzY8hdps9imMCCAFlTmjLYgsv3qrdXMMpoq0RW-u0bqardUwKJR66x2IxRB8-IuAdByG6TrTU4mm10IE1T5F5BvoP1UoCyHM3xRoWDKYZWXYJN6LBvTnfG5_7AbaU1zEANxG0ZE-GdOHEXwZxg4ywwN_81BDaOpbDe95Hehsr5QhEhrYepFcdig2wMMlYcRpxyrnifAjfQNqYKNcl4Dfa-Lc9"
                />
                <div>
                  <div className="font-body-sm text-body-sm font-bold text-on-surface">Elena Rodriguez</div>
                  <div className="font-label-md text-[11px] text-on-surface-variant">Seattle, WA • Booked Full Metabolic Panel</div>
                </div>
              </div>
            </div>

            {/* Mini Stats Bar */}
            <div className="grid grid-cols-3 gap-sm pt-xs">
              <div className="p-sm rounded-xl bg-surface-container-lowest shadow-sm text-center border border-outline-variant/20">
                <span className="font-headline-lg text-headline-lg font-bold text-primary">99.8%</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant block mt-base">Sample Integrity Rate</span>
              </div>
              <div className="p-sm rounded-xl bg-surface-container-lowest shadow-sm text-center border border-outline-variant/20">
                <span className="font-headline-lg text-headline-lg font-bold text-secondary">&lt; 14h</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant block mt-base">Average Turnaround</span>
              </div>
              <div className="p-sm rounded-xl bg-surface-container-lowest shadow-sm text-center border border-outline-variant/20">
                <span className="font-headline-lg text-headline-lg font-bold text-tertiary">42+</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant block mt-base">Major Insurances Supported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMINENT PRESCRIPTION UPLOAD BANNER */}
      <section className="w-full bg-surface-container-highest/60 py-lg border-t border-outline-variant/20">
        <div className="max-w-[1200px] mx-auto px-lg">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-container text-on-primary p-lg lg:p-xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-lg relative overflow-hidden">
            {/* Background SVG pattern */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 text-on-primary/5 pointer-events-none">
              <svg fill="currentColor" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80"></circle>
                <path d="M70,100 L130,100 M100,70 L100,130" stroke="currentColor" strokeWidth="14" strokeLinecap="round"></path>
              </svg>
            </div>

            <div className="flex items-center gap-md relative z-10 max-w-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[36px] text-secondary-fixed">document_scanner</span>
              </div>
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-base text-secondary-fixed font-label-md text-label-md uppercase tracking-wider font-bold mb-base">
                  <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                  Fast-Track Booking
                </div>
                <h3 className="font-headline-lg text-headline-lg text-white font-bold leading-tight">
                  Have a Doctor’s Prescription?
                </h3>
                <p className="font-body-sm text-body-sm text-primary-fixed mt-xs">
                  Upload an image or PDF. Our certified clinical team will identify your tests, suggest the best-priced labs, apply insurance eligibility, and schedule phlebotomy.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-sm relative z-10 shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => navigate('/patient/cart')}
                className="w-full sm:w-auto px-lg py-sm rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container font-label-md text-label-md font-bold text-center shadow-md transition-all flex items-center justify-center gap-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Upload Prescription</span>
              </button>
              <button
                type="button"
                onClick={() => toast('WhatsApp order assistance initiated. Opening chat...', { icon: '💬' })}
                className="w-full sm:w-auto px-md py-sm rounded-xl bg-white/15 hover:bg-white/25 text-white font-label-md text-label-md font-semibold text-center backdrop-blur-sm transition-all flex items-center justify-center gap-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>WhatsApp Order</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/20 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-lg py-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-lg mb-xl">
            <div className="lg:col-span-2 flex flex-col gap-sm">
              <div className="flex items-center gap-xs">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">local_hospital</span>
                </div>
                <span className="font-title-md text-title-md text-primary tracking-tight font-bold">LabEase</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant pr-md">
                Accredited diagnostic marketplace delivering accurate laboratory investigations, home sample collection, and verified electronic health reports with end-to-end clinical compliance.
              </p>
              <div className="flex items-center gap-xs mt-base">
                <span className="material-symbols-outlined text-secondary text-[20px]">support_agent</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-outline uppercase tracking-wider">Emergency Clinical Helpline</span>
                  <span className="font-title-md text-title-md text-primary font-bold">+1 (800) 432-8482</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-xs font-bold">Diagnostic Services</h4>
              <button type="button" onClick={() => navigate('/patient/search')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Pathology Panels</button>
              <button type="button" onClick={() => navigate('/patient/search?q=radiology')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Radiology & Imaging</button>
              <button type="button" onClick={() => navigate('/patient/search?q=package')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Preventive Full Body Checkups</button>
              <button type="button" onClick={() => navigate('/patient/search')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Home Phlebotomy Service</button>
            </div>

            <div className="flex flex-col gap-xs">
              <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-xs font-bold">Provider Network</h4>
              <button type="button" onClick={() => navigate('/patient/search')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Accredited Centers</button>
              <button type="button" onClick={() => navigate('/patient/bookings')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">My Bookings Portal</button>
              <button type="button" onClick={() => navigate('/patient/profile')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Patient Health Profile</button>
            </div>

            <div className="flex flex-col gap-xs">
              <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-xs font-bold">Accreditations & Trust</h4>
              <div className="flex flex-col gap-xs">
                <div className="flex items-center gap-xs p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">CAP Accredited</span>
                    <span className="font-label-md text-[10px] text-on-surface-variant">College of American Pathologists</span>
                  </div>
                </div>
                <div className="flex items-center gap-xs p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">NABL & ISO 15189</span>
                    <span className="font-label-md text-[10px] text-on-surface-variant">International Medical Standards</span>
                  </div>
                </div>
                <div className="flex items-center gap-xs p-xs bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">HIPAA Compliant</span>
                    <span className="font-label-md text-[10px] text-on-surface-variant">256-Bit Encrypted Lab Vault</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-md flex flex-col md:flex-row items-center justify-between gap-sm border-t border-outline-variant/10">
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 LabEase Inc. All clinical rights reserved. Validated medical laboratory marketplace.</p>
            <div className="flex items-center gap-md">
              <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Privacy Policy</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Terms of Clinical Service</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">Patient Rights</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
