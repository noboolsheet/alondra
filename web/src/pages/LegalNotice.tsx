import { LegalPage } from "@/components/LegalPage";
import { useLang } from "@/i18n/LanguageContext";

const LegalNotice = () => {
  const { t } = useLang();
  return <LegalPage data={t.legal.notice} />;
};

export default LegalNotice;
