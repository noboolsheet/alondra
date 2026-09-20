import { LegalPage } from "@/components/LegalPage";
import { useLang } from "@/i18n/LanguageContext";

const Privacy = () => {
  const { t } = useLang();
  return <LegalPage data={t.legal.privacy} />;
};

export default Privacy;
