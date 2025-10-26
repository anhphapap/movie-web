import { useSEOManager } from "../context/SEOManagerContext";
import SEO from "./SEO";

const SEOGlobal = () => {
  const { currentSEO } = useSEOManager();

  return <SEO seoData={currentSEO} baseUrl={window.location.origin} />;
};

export default SEOGlobal;
