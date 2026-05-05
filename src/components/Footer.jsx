import '../styles/footer.css';

const institutionLogoUrl =
  'https://qftsvgnhxcqdrcarvsiq.supabase.co/storage/v1/object/public/images/utils/polijic.png';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <section
          className="app-footer-brand"
          aria-label="Informacion institucional"
        >
          <div className="app-footer-logo-card">
            <img
              className="app-footer-logo"
              src={institutionLogoUrl}
              alt="Logo institucional"
            />
          </div>
          <p className="app-footer-brand-copy">
            Plataforma desarollada desde la coordinación de nuevas tecnologías
            educativas.
          </p>
        </section>

        <section className="app-footer-info">
          <div className="app-footer-section">
            <h3>Sobre la aplicacion</h3>
            <p>
              Esta herramienta facilita la construccion de presentaciones con
              apoyo de automatizacion, edicion visual y exportacion a distintos
              formatos.
            </p>
          </div>

          <div className="app-footer-section">
            <h3>Creditos de imagenes</h3>
            <p>
              Las imagenes integradas automaticamente en las presentaciones se
              obtienen a traves de la API de Pexels.
            </p>

            <div className="app-footer-links">
              <a
                href="https://www.pexels.com/"
                target="_blank"
                rel="noreferrer"
              >
                Pexels
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="app-footer-bottom">
        <p>{currentYear} PresentAI. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
