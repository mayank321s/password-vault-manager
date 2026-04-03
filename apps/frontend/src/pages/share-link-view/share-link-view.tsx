import { PiNoteFill, PiPasswordFill } from 'react-icons/pi';
import * as styles from './share-link-view.css';
import { useShareLinkViewPage } from './share-link-view.hook';

export default function ShareLinkViewPage() {
  const {
    shareData,
    isLoading,
    error,
    encryptionKey,
    decryptedData,
    decryptionError,
    copyState,
    viewed,
    handleCopy,
    handleGoHome,
    getErrorInfo,
  } = useShareLinkViewPage();

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              <span>🔗</span>
              Shared Password
            </h1>
            <p className={styles.subtitle}>Loading shared password...</p>
          </div>
          <div className={styles.body}>
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p className={styles.loadingText}>
                Retrieving and decrypting password...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || decryptionError || !encryptionKey) {
    const { errorTitle, errorDetail } = getErrorInfo();

    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              <span>🔗</span>
              Shared Password
            </h1>
          </div>
          <div className={styles.body}>
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>❌</div>
              <h2 className={styles.errorTitle}>{errorTitle}</h2>
              <p className={styles.errorMessage}>{errorDetail}</p>
              <button className={styles.btnSecondary} onClick={handleGoHome}>
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shareData && decryptedData && viewed) {
    const isNote = decryptedData.type === 'note';

    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {isNote ? <PiNoteFill /> : <PiPasswordFill />}
              {decryptedData.name}
            </h1>
            <p className={styles.subtitle}>
              {isNote ? 'Secure Note' : 'Password'}
            </p>
          </div>

          <div className={styles.body}>
            <div className={styles.warningBox}>
              <div className={styles.warningTitle}>
                <span>⚠️ Warning</span>
              </div>
              <p className={styles.warningText}>
                This is a one time view link, you won't be able to access this
                password again after you leave this page.
              </p>
            </div>

            {isNote ? (
              <div className={styles.noteText}>
                <div className={styles.noteLines}>
                  {decryptedData.content.split('\n').map((line, i) => (
                    <div key={i} className={styles.noteLine}>
                      <span className={styles.noteLineNumber}>{i + 1}</span>
                      <span className={styles.noteLineContent}>
                        {line || ' '}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {decryptedData.fields.map((field, i) => {
                  const key = `field-${i}`;
                  const isCopied = copyState[key];
                  return (
                    <div key={i} className={styles.detailFieldRow}>
                      <div className={styles.detailSectionLabel}>
                        {field.label}
                      </div>
                      <div className={styles.fieldValueRow}>
                        <span className={styles.fieldValueText}>
                          {field.value}
                        </span>
                        <button
                          className={`${styles.iconButton}${isCopied ? ` ${styles.iconButtonCopied}` : ''}`}
                          onClick={() => handleCopy(key, field.value)}
                          disabled={isCopied}
                          title={`Copy ${field.label}`}
                        >
                          {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span>🔗</span>
            Shared Password
          </h1>
        </div>
        <div className={styles.body}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Processing...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
