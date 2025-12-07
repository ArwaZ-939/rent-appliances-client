import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardTitle,
  CardImg,
  Button,
  Spinner,
  CardText,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupText
} from 'reactstrap';
import { useLocation } from 'react-router-dom';
import { DarkModeContext } from './DarkModeContext';
import { useTranslation } from 'react-i18next';

const ApplianceCards = ({ onRentClick }) => {
  const { t, i18n } = useTranslation();
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const location = useLocation();
  const { darkMode } = useContext(DarkModeContext);

  // Translation mapping for appliance names and details
  const getApplianceTranslation = (appliance) => {
    const isArabic = i18n.language === 'ar';
    
    // If appliance has translation fields in database, use them
    if (isArabic && appliance.name_ar) {
      return {
        name: appliance.name_ar,
        details: appliance.details_ar || appliance.details
      };
    }
    
    // Fallback: Use translation mapping for common appliances
    const translationMap = {
      'Washing Machine': {
        name: 'غسالة',
        details: 'غسالة عالية الجودة لتنظيف ملابسك بكفاءة'
      },
      'Refrigerator': {
        name: 'ثلاجة',
        details: 'ثلاجة حديثة لحفظ الطعام طازجًا'
      },
      'Microwave': {
        name: 'ميكروويف',
        details: 'ميكروويف سريع لتسخين الطعام'
      },
      'Dishwasher': {
        name: 'غسالة صحون',
        details: 'غسالة صحون تلقائية لتنظيف الأطباق'
      },
      'Air Conditioner': {
        name: 'مكيف هواء',
        details: 'مكيف هواء لتبريد منزلك'
      },
      'Television': {
        name: 'تلفزيون',
        details: 'تلفزيون عالي الجودة للترفيه'
      },
      'Vacuum Cleaner': {
        name: 'مكنسة كهربائية',
        details: 'مكنسة كهربائية قوية لتنظيف منزلك'
      },
      'Oven': {
        name: 'فرن',
        details: 'فرن للطبخ والخبز'
      },
      'Blender': {
        name: 'خلاط',
        details: 'خلاط قوي لتحضير العصائر'
      },
      'Coffee Maker': {
        name: 'آلة قهوة',
        details: 'آلة قهوة لتحضير القهوة الطازجة'
      }
    };
    
    if (isArabic && translationMap[appliance.name]) {
      return translationMap[appliance.name];
    }
    
    // Default: return original
    return {
      name: appliance.name,
      details: appliance.details
    };
  };

  const fetchAppliances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getSpecificAppliance');
      setAppliances(response.data.Appliance || []);
    } catch (error) {
      console.error('Error fetching appliances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
    const interval = setInterval(fetchAppliances, 10000);
    
    // Listen for appliance updates (when orders are placed)
    const handleStorageChange = () => {
      fetchAppliances();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('applianceUpdated', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('applianceUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/home' || location.pathname === '/') {
      fetchAppliances();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/suggestions?keyword=${searchTerm}`);
        // Get suggestions and translate them based on current language
        const suggestionsList = res.data || [];
        const translatedSuggestions = suggestionsList.map(suggestion => {
          // suggestion is now an object with name and name_ar
          const applianceName = suggestion.name || suggestion;
          // Find the appliance to get its translation
          const appliance = appliances.find(a => a.name === applianceName);
          if (appliance) {
            const translated = getApplianceTranslation(appliance).name;
            return { display: translated, original: applianceName };
          }
          return { display: applianceName, original: applianceName };
        });
        // Remove duplicates based on original name
        const uniqueSuggestions = translatedSuggestions.reduce((acc, curr) => {
          if (!acc.find(item => item.original === curr.original)) {
            acc.push(curr);
          }
          return acc;
        }, []);
        setSuggestions(uniqueSuggestions.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(uniqueSuggestions.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, appliances]);

  const handleSuggestionClick = (suggestion) => {
    // suggestion can be either a string (old format) or object (new format)
    const searchValue = typeof suggestion === 'object' ? suggestion.original : suggestion;
    setSearchTerm(searchValue);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatPrice = (price) => {
    if (!price) return '';
    const cleanPrice = price.toString().trim();
    return cleanPrice.toUpperCase().includes('OR') ? cleanPrice : `${cleanPrice} OR`;
  };

  const handleRentClickInternal = (appliance) => {
    if (onRentClick) {
      const priceMatch = appliance.price.toString().match(/\d+/);
      const price = priceMatch ? parseInt(priceMatch[0]) : 0;
      onRentClick(price, appliance);
    }
  };

  // Filter appliances based on search term (works with both English and Arabic)
  const filteredAppliances = appliances.filter(appliance => {
    const translation = getApplianceTranslation(appliance);
    const searchLower = searchTerm.toLowerCase();
    return appliance.name.toLowerCase().includes(searchLower) || 
           translation.name.toLowerCase().includes(searchLower);
  });

  // Count only available appliances by name (for the badge)
  const applianceCounts = appliances.reduce((acc, appliance) => {
    if (appliance.available) {
      const name = appliance.name;
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {});

  // Get unique appliances by name for display (show one card per appliance type)
  const uniqueAppliances = filteredAppliances.reduce((acc, appliance) => {
    if (!acc.find(item => item.name === appliance.name)) {
      acc.push(appliance);
    }
    return acc;
  }, []);

  if (loading) {
    return <div className="text-center mt-4"><Spinner color="primary" /></div>;
  }

  return (
    <div className="mt-4 container">
      {/* 🔍 Search Bar */}
      <div style={{ position: 'relative', maxWidth: '450px', margin: '0 auto' }}>
        <InputGroup className="mb-3 shadow-sm">
          <Input
            type="text"
            placeholder={t('catalog.searchAppliances')}
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow click events
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className={darkMode ? 'bg-dark text-light border-secondary' : ''}
            autoComplete="off"
          />
          <InputGroupText style={{ color: 'gray', cursor: 'pointer' }}>🔍</InputGroupText>
        </InputGroup>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: darkMode ? '#343a40' : '#fff',
            border: darkMode ? '1px solid #6c757d' : '1px solid #ccc',
            listStyle: 'none',
            padding: 0,
            margin: '5px 0 0 0',
            maxHeight: '200px',
            overflowY: 'auto',
            borderRadius: '8px',
            boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
          }}>
            {suggestions.map((item, idx) => {
              const displayText = typeof item === 'object' ? item.display : item;
              return (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  style={{
                    padding: '12px 15px',
                    cursor: 'pointer',
                    borderBottom: idx < suggestions.length - 1 ? (darkMode ? '1px solid #6c757d' : '1px solid #eee') : 'none',
                    fontSize: '14px',
                    color: darkMode ? '#ffffff' : '#000000',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#495057' : '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = darkMode ? '#343a40' : '#fff'}
                >
                  {displayText}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 🛒 Products Grid */}
      <Row
        xs="1"
        sm="2"
        md="3"
        lg="4"
        className="g-4 mt-4 justify-content-start"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        {uniqueAppliances.length > 0 ? (
          uniqueAppliances.map((appliance) => {
            const count = applianceCounts[appliance.name] || 0;
            // Only show appliances that have at least one available
            if (count === 0) return null;
            return (
            <Col key={appliance._id} className="d-flex">
              <Card
                className={`shadow-sm w-100 border-0 ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}
                style={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {appliance.imgUrl && (
                  <CardImg
                    top
                    src={appliance.imgUrl}
                    alt={appliance.name}
                    style={{
                      height: '220px',
                      objectFit: 'contain',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                      backgroundColor: '#f8f9fa',
                    }}
                  />
                )}
                <CardBody className="d-flex flex-column justify-content-between">
                  <div>
                    <CardTitle tag="h5" className={`mb-2 ${darkMode ? 'text-light' : 'text-primary'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{getApplianceTranslation(appliance).name}</span>
                      <span style={{
                        backgroundColor: '#7B4F2C',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {count}
                      </span>
                    </CardTitle>
                    <CardText className={`mb-2 ${darkMode ? 'text-light' : 'text-muted'}`}>
                      <strong>{t('catalog.pricePerDay')}</strong> {formatPrice(appliance.price)}
                    </CardText>
                    <CardText style={{ fontSize: '14px' }}>{getApplianceTranslation(appliance).details}</CardText>
                  </div>
                  <div className="mt-3">
                    <CardText className={count > 0 ? 'text-success' : 'text-danger'}>
                      {count > 0 ? `${count} ${t('catalog.available')}` : t('catalog.outOfStock')}
                    </CardText>
                    <Button
                      color={darkMode ? "outline-light" : "primary"}
                      className="w-100 mt-2"
                      disabled={count === 0}
                      onClick={() => handleRentClickInternal(appliance)}
                    >
                      {t('catalog.rentNow')}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
            );
          }).filter(item => item !== null)
        ) : (
          <Col>
            <p className={`text-center mt-4 ${darkMode ? 'text-light' : 'text-muted'}`}>{t('catalog.noAppliancesFound')}</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ApplianceCards;