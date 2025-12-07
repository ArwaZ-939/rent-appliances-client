
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, CardBody, CardTitle, CardImg, Button, CardText, Row, Col, Input, Label, FormGroup } from 'reactstrap';
import Header from '../sections/Header';
import Footer from '../sections/Footer';
import { DarkModeContext } from '../sections/DarkModeContext';
import { useNavigate } from 'react-router-dom';
import '../css/Contact.css';
import { useTranslation } from 'react-i18next';

const SmartRecom = () => {
    const { t, i18n } = useTranslation();
    const [budget, setBudget] = useState('');
    const [appliances, setAppliances] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { darkMode } = useContext(DarkModeContext);
    const navigate = useNavigate();

    // Translation mapping for appliance names and details (same as AppliancesCatalog)
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

    // Fetch all appliances on component mount
    useEffect(() => {
        const fetchAppliances = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getSpecificAppliance');
                setAppliances(response.data.Appliance || []);
            } catch (error) {
                console.error('Error fetching appliances:', error);
            }
        };
        fetchAppliances();
    }, []);

    // Recommendation logic
    const getRecommendations = () => {
        if (!budget) {
            return [];
        }

        const budgetAmount = parseInt(budget);

        // Filter appliances within budget
        let filtered = appliances.filter(appliance => {
            const price = parseInt(appliance.price) || 0;
            return price <= budgetAmount && appliance.available;
        });

        // Score appliances based on budget and importance
        const scoredAppliances = filtered.map(appliance => {
            let score = 0;
            const applianceName = appliance.name.toLowerCase();
            const price = parseInt(appliance.price) || 0;

            // Essential appliances always get a boost
            const essentialKeywords = ['refrigerator', 'fridge', 'washing', 'microwave', 'oven', 'stove'];
            if (essentialKeywords.some(keyword => applianceName.includes(keyword))) {
                score += 3;
            }

            // Popular/common appliances get a boost
            const popularKeywords = ['vacuum', 'cleaner', 'dishwasher', 'dryer', 'air', 'fan', 'heater'];
            if (popularKeywords.some(keyword => applianceName.includes(keyword))) {
                score += 2;
            }

            // Budget optimization - prefer appliances that use budget efficiently
            const budgetRatio = price / budgetAmount;
            if (budgetRatio > 0.7 && budgetRatio <= 1.0) {
                score += 2; // High-value items that maximize budget usage
            } else if (budgetRatio <= 0.3) {
                score += 1; // Budget-friendly items
            } else if (budgetRatio > 0.3 && budgetRatio <= 0.7) {
                score += 1.5; // Good value items
            }

            // Prefer items closer to budget (but not over)
            const budgetDistance = Math.abs(budgetAmount - price);
            const maxDistance = budgetAmount;
            const distanceScore = 1 - (budgetDistance / maxDistance);
            score += distanceScore * 0.5;

            return { ...appliance, score };
        });

        // Sort by score (highest first) and take top recommendations
        const sorted = scoredAppliances.sort((a, b) => b.score - a.score);
        return sorted.slice(0, 12); // Return top 12 recommendations
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const budgetValue = parseInt(budget);
        
        if (!budget || budgetValue <= 0) {
            alert(t('smartRecom.invalidBudget'));
            return;
        }
        
        setLoading(true);
        setSubmitted(true);
        
        // Simulate a small delay for better UX
        setTimeout(() => {
            const recs = getRecommendations();
            setRecommendations(recs);
            setLoading(false);
        }, 500);
    };

    const handleReset = () => {
        setBudget('');
        setRecommendations([]);
        setSubmitted(false);
    };

    const handleRentClick = (appliance) => {
        const priceMatch = appliance.price.toString().match(/\d+/);
        const price = priceMatch ? parseInt(priceMatch[0]) : 0;
        navigate('/Rental', {
            state: {
                appliance: {
                    name: appliance.name,
                    details: appliance.details
                },
                price: price
            }
        });
    };

    const formatPrice = (price) => {
        if (!price) return '';
        // Convert to integer and format
        const priceInt = parseInt(price) || 0;
        const cleanPrice = priceInt.toString().trim();
        return cleanPrice.toUpperCase().includes('OR') || cleanPrice.toUpperCase().includes('OMR') 
            ? cleanPrice 
            : `${cleanPrice} OMR`;
    };

    return (
        <div className={`main-contact ${darkMode ? 'bg-dark text-light' : ''}`} style={{ minHeight: '100vh' }}>
            <Header />
            
            <div className="container contact-container">
                <div className="contact-content" style={{ flexDirection: 'column', maxWidth: '1200px' }}>
                    <h2 style={{ 
                        color: '#7B4F2C', 
                        textAlign: 'center', 
                        marginBottom: '15px',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                    }}>
                        <i className="bi bi-lightbulb-fill me-2" style={{ color: '#ffc107' }}></i>
                        {t('smartRecom.title')}
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        marginBottom: '30px', 
                        color: darkMode ? '#ccc' : '#666',
                        fontSize: '1rem',
                        maxWidth: '600px',
                        margin: '0 auto 30px'
                    }}>
                        {t('smartRecom.subtitle')}
                    </p>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
                        <Row className="justify-content-center">
                            <Col md={6} lg={4}>
                                <FormGroup>
                                    <Label htmlFor="budget" style={{ fontWeight: 'bold', color: darkMode ? '#fff' : '#333', marginBottom: '10px' }}>
                                        <i className="bi bi-currency-exchange me-2"></i>
                                        {t('smartRecom.budget')} <span className="text-danger">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        id="budget"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder={t('smartRecom.budgetPlaceholder')}
                                        min="1"
                                        step="1"
                                        className={darkMode ? 'bg-dark text-light border-secondary' : ''}
                                        required
                                        style={{ fontSize: '18px', padding: '12px' }}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Button
                                type="submit"
                                className="btn-submit me-2"
                                style={{
                                    padding: '12px 40px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#7B4F2C',
                                    border: 'none',
                                    color: '#fff'
                                }}
                            >
                                <i className="bi bi-search me-2"></i>
                                {t('smartRecom.getRecommendations')}
                            </Button>
                        </div>
                    </form>

                    {/* Loading State */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">{t('smartRecom.loading')}</span>
                            </div>
                            <p style={{ marginTop: '15px', color: darkMode ? '#ccc' : '#666' }}>
                                {t('smartRecom.analyzing')}
                            </p>
                        </div>
                    )}

                    {/* Recommendations Display */}
                    {submitted && !loading && (
                        <div>
                            <div style={{ 
                                textAlign: 'center', 
                                marginBottom: '30px',
                                padding: '15px',
                                backgroundColor: darkMode ? 'rgba(123, 79, 44, 0.1)' : 'rgba(123, 79, 44, 0.05)',
                                borderRadius: '10px'
                            }}>
                                <h3 style={{ color: '#7B4F2C', marginBottom: '10px' }}>
                                    <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
                                    {t('smartRecom.recommendedAppliances')}
                                </h3>
                                {recommendations.length > 0 && (
                                    <p style={{ color: darkMode ? '#aaa' : '#666', margin: 0, fontSize: '14px' }}>
                                        {i18n.language === 'ar' 
                                            ? `تم العثور على ${recommendations.length} ${recommendations.length !== 1 ? 'أجهزة' : 'جهاز'} ضمن ميزانيتك البالغة ${formatPrice(budget)}`
                                            : `Found ${recommendations.length} appliance${recommendations.length !== 1 ? 's' : ''} within your budget of ${formatPrice(budget)}`
                                        }
                                    </p>
                                )}
                            </div>
                            {recommendations.length > 0 ? (
                                <Row className="g-4">
                                    {recommendations.map((appliance) => (
                                        <Col key={appliance._id} xs="12" sm="6" md="4" lg="3">
                                            <Card
                                                className={`shadow-sm border-0 ${darkMode ? 'bg-dark text-light' : 'bg-white'}`}
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    borderRadius: '12px',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    border: darkMode ? '1px solid rgba(123, 79, 44, 0.2)' : '1px solid #e9ecef'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                                    e.currentTarget.style.boxShadow = darkMode 
                                                        ? '0 8px 20px rgba(123, 79, 44, 0.3)' 
                                                        : '0 8px 20px rgba(0, 0, 0, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '';
                                                }}
                                            >
                                                {appliance.imgUrl && (
                                                    <CardImg
                                                        top
                                                        src={appliance.imgUrl}
                                                        alt={appliance.name}
                                                        style={{
                                                            height: '200px',
                                                            objectFit: 'contain',
                                                            borderTopLeftRadius: '12px',
                                                            borderTopRightRadius: '12px',
                                                            backgroundColor: '#f8f9fa',
                                                        }}
                                                    />
                                                )}
                                                <CardBody className="d-flex flex-column justify-content-between">
                                                    <div>
                                                        <CardTitle tag="h5" style={{ 
                                                            color: '#7B4F2C', 
                                                            marginBottom: '12px',
                                                            fontSize: '1.1rem',
                                                            fontWeight: 'bold',
                                                            minHeight: '50px'
                                                        }}>
                                                            {getApplianceTranslation(appliance).name}
                                                        </CardTitle>
                                                        <div style={{
                                                            backgroundColor: darkMode ? 'rgba(123, 79, 44, 0.15)' : 'rgba(123, 79, 44, 0.1)',
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            marginBottom: '12px'
                                                        }}>
                                                            <CardText style={{ fontSize: '15px', margin: 0, fontWeight: 'bold', color: '#7B4F2C' }}>
                                                                <i className="bi bi-tag-fill me-2"></i>
                                                                {formatPrice(appliance.price)} {t('smartRecom.perDay')}
                                                            </CardText>
                                                        </div>
                                                        <CardText style={{ 
                                                            fontSize: '13px', 
                                                            color: darkMode ? '#bbb' : '#666',
                                                            lineHeight: '1.5',
                                                            minHeight: '60px'
                                                        }}>
                                                            {getApplianceTranslation(appliance).details}
                                                        </CardText>
                                                    </div>
                                                    <div className="mt-3">
                                                        <CardText className={appliance.available ? 'text-success mb-2' : 'text-danger mb-2'} style={{ fontWeight: '500' }}>
                                                            <i className={`bi ${appliance.available ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-2`}></i>
                                                            {appliance.available ? t('catalog.available') : t('smartRecom.unavailable')}
                                                        </CardText>
                                                        <Button
                                                            color="primary"
                                                            className="w-100"
                                                            style={{ 
                                                                backgroundColor: '#7B4F2C', 
                                                                border: 'none',
                                                                padding: '10px',
                                                                fontWeight: 'bold',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            disabled={!appliance.available}
                                                            onClick={() => handleRentClick(appliance)}
                                                            onMouseEnter={(e) => {
                                                                if (appliance.available) {
                                                                    e.target.style.backgroundColor = '#aa9937';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (appliance.available) {
                                                                    e.target.style.backgroundColor = '#7B4F2C';
                                                                }
                                                            }}
                                                        >
                                                            <i className="bi bi-cart-plus me-2"></i>
                                                            {t('catalog.rentNow')}
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '50px 40px',
                                    backgroundColor: darkMode ? '#343a40' : '#f8f9fa',
                                    borderRadius: '10px',
                                    border: darkMode ? '1px solid rgba(123, 79, 44, 0.2)' : '1px solid #dee2e6'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                                    <h4 style={{ 
                                        color: darkMode ? '#fff' : '#333',
                                        marginBottom: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {t('smartRecom.noRecommendations')}
                                    </h4>
                                    <p style={{ fontSize: '16px', color: darkMode ? '#aaa' : '#666', marginBottom: '20px' }}>
                                        {t('smartRecom.noRecommendationsMessage', { budget: formatPrice(budget) })}
                                    </p>
                                    <p style={{ fontSize: '14px', color: darkMode ? '#888' : '#999' }}>
                                        {t('smartRecom.tryIncreasingBudget')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SmartRecom;