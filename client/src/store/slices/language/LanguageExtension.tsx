import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LanguageType, translations } from "./translation";

const translationSelector = (state: RootState) => (key: LanguageType): string => {
    return translations[state.language.value][key] || key;
}

// React hook to access the translation helper from Redux state
export const useTranslation = () => useSelector(translationSelector);

export default useTranslation;