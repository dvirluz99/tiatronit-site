import styles from './page.module.css';
import { getPuppetsData } from '../../lib/data';
import { plainTextToHtml } from '../../lib/recommendationContent';
import ScrollReveal from '../../components/ScrollReveal';

export default async function PuppetsPage() {
  const data = await getPuppetsData();

  if (!data) {
    return (
      <main>
        <div className={styles.container}>
          <p style={{ textAlign: 'center' }}>טוען נתונים...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.container}>

        <ScrollReveal as="header" className={styles.header}>
          <span className={styles.eyebrow}>הגישה</span>
          <h1 className={styles.title}>{data.title}</h1>
          {data.subtitle && (
            <p
              className={styles.subtitle}
              dangerouslySetInnerHTML={{ __html: plainTextToHtml(data.subtitle) }}
            />
          )}
        </ScrollReveal>

        {data.youtubeVideoId && (
          <ScrollReveal variant="fade" className={styles.videoSection}>
            <div className={styles.videoWrapper}>
              <iframe
                src={`https://www.youtube.com/embed/${data.youtubeVideoId}`}
                title="הסבר על הבובות"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </ScrollReveal>
        )}

        <section className={styles.infoSection}>
          <ScrollReveal className={styles.infoIntro}>
            {data.infoSectionTitle && (
              <h2 className={styles.infoTitle}>{data.infoSectionTitle}</h2>
            )}
            {data.paragraph && (
              <div
                className={styles.paragraph}
                dangerouslySetInnerHTML={{ __html: plainTextToHtml(data.paragraph) }}
              />
            )}
          </ScrollReveal>

          {data.infoList && data.infoList.length > 0 && (
            <>
              <ScrollReveal variant="fade">
                <hr className={styles.divider} />
                {data.infoListTitle && (
                  <h3 className={styles.subTitle} style={{ marginTop: 'var(--sp-6)' }}>
                    {data.infoListTitle}
                  </h3>
                )}
              </ScrollReveal>

              <ul className={styles.infoList}>
                {data.infoList.map((item, index) => (
                  <ScrollReveal
                    key={index}
                    as="li"
                    className={styles.principleCard}
                    delay={Math.min(index * 80, 320)}
                  >
                    <h4 className={styles.principleTitle}>{item.title}</h4>
                    <p className={styles.principleText}>{item.text}</p>
                  </ScrollReveal>
                ))}
              </ul>
            </>
          )}

          {data.summaryQuote && (
            <ScrollReveal variant="fade">
              <div className={styles.summaryBox}>
                <p>{data.summaryQuote}</p>
              </div>
            </ScrollReveal>
          )}
        </section>

      </div>
    </main>
  );
}
