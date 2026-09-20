import { LegalPage } from "@/components/LegalPage";
import { useLang } from "@/i18n/LanguageContext";

const Cookies = () => {
  const { t } = useLang();
  return <LegalPage data={t.legal.cookies} />;
};

export default Cookies;
