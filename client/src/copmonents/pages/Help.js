import Footer from '../sections/Footer';
import Header from '../sections/Header';
import { useTranslation } from 'react-i18next';


const Help = () => {
    const { t } = useTranslation();
    return(
        <>
        <div className="main-contact">
    <Header />
    <div className="container contact-container">
      <div className="contact-content">
        <div>
        </div>
        <div className="contact-form">
          <h2 style={{ color: '#7B4F2C' }}>{t('help.title')}</h2>
          <form>
          <div className="modal-body">
                <h5>{t('help.returnWindow')}</h5>
                <p>{t('help.returnWindowText')}</p>
                
                <h5>{t('help.conditionOfReturn')}</h5>
                <p>{t('help.conditionOfReturnText')}</p>
                
                <h5>{t('help.returnProcess')}</h5>
                <p><strong>{t('help.returnProcessText')}</strong>

                    <ul>
                        <li>{t('help.inspectionItem')}</li>
                        <li>{t('help.earlyReturnItem')}</li>
                    </ul>
                </p>
                <h5>{t('help.lateReturnPenalty')}</h5>
                <p>{t('help.lateReturnPenaltyText')}</p>  
                <h5>{t('help.adminBlock')}</h5>
                <h5>{t('help.returnPolicy')}</h5>
                <p>{t('help.returnPolicyText')}</p>                            
            </div>
          </form>
        </div>
      </div>
    </div>
    <Footer />

  </div>
        
        </>
    )
};

export default Help;
