import { Language } from './translations';

export interface AntibioticOptions {
  woundTypeOptions: Array<{ value: string; label: string }>;
  woundLocationOptions: Array<{ value: string; label: string }>;
  contaminationTypeOptions: Array<{ value: string; label: string }>;
  renalFunctionOptions: Array<{ value: string; label: string }>;
}

export const antibioticOptions: Record<Language, AntibioticOptions> = {
  en: {
    woundTypeOptions: [
      { value: 'clean', label: 'Clean wound' },
      { value: 'open-fracture', label: 'Open fracture' },
      { value: 'contaminated', label: 'Contaminated wound' },
      { value: 'bite', label: 'Bite (human/animal)' },
      { value: 'water-fresh', label: 'Fresh water wound' },
      { value: 'water-salt', label: 'Salt water wound' },
      { value: 'gunshot', label: 'Gunshot wound' },
      { value: 'abdominal', label: 'Penetrating abdominal trauma' },
      { value: 'crush', label: 'Crush injury' },
      { value: 'farm', label: 'Farm injury' },
    ],
    woundLocationOptions: [
      { value: 'hand-foot', label: 'Hand/foot' },
      { value: 'face', label: 'Face' },
      { value: 'perineum', label: 'Perineum' },
      { value: 'groin', label: 'Groin' },
      { value: 'armpit', label: 'Armpit' },
      { value: 'joint', label: 'Near joint' },
      { value: 'bone', label: 'Bone surface' },
      { value: 'other', label: 'Other' },
    ],
    contaminationTypeOptions: [
      { value: 'none', label: 'No contamination' },
      { value: 'soil', label: 'Soil/dirt' },
      { value: 'feces', label: 'Feces' },
      { value: 'saliva', label: 'Saliva' },
      { value: 'foreign-body', label: 'Foreign body' },
      { value: 'high-energy', label: 'High-energy trauma' },
      { value: 'crush-injury', label: 'Crush injury' },
    ],
    renalFunctionOptions: [
      { value: 'normal', label: 'Normal renal function' },
      { value: 'mild', label: 'Mild renal insufficiency' },
      { value: 'moderate', label: 'Moderate renal insufficiency' },
      { value: 'severe', label: 'Severe renal insufficiency' },
    ],
  },
  ru: {
    woundTypeOptions: [
      { value: 'clean', label: 'Чистая рана' },
      { value: 'open-fracture', label: 'Открытый перелом' },
      { value: 'contaminated', label: 'Контаминированная рана' },
      { value: 'bite', label: 'Укус (человек/животное)' },
      { value: 'water-fresh', label: 'Рана в пресной воде' },
      { value: 'water-salt', label: 'Рана в соленой воде' },
      { value: 'gunshot', label: 'Огнестрельное ранение' },
      { value: 'abdominal', label: 'Проникающая травма живота' },
      { value: 'crush', label: 'Раздавливающая травма' },
      { value: 'farm', label: 'Фермерская травма' },
    ],
    woundLocationOptions: [
      { value: 'hand-foot', label: 'Кисть/стопа' },
      { value: 'face', label: 'Лицо' },
      { value: 'perineum', label: 'Промежность' },
      { value: 'groin', label: 'Паховая область' },
      { value: 'armpit', label: 'Подмышка' },
      { value: 'joint', label: 'Около сустава' },
      { value: 'bone', label: 'Костная поверхность' },
      { value: 'other', label: 'Другое' },
    ],
    contaminationTypeOptions: [
      { value: 'none', label: 'Нет загрязнения' },
      { value: 'soil', label: 'Грунт/почва' },
      { value: 'feces', label: 'Фекалии' },
      { value: 'saliva', label: 'Слюна' },
      { value: 'foreign-body', label: 'Инородное тело' },
      { value: 'high-energy', label: 'Высокоэнергетическая травма' },
      { value: 'crush-injury', label: 'Раздавливающая травма' },
    ],
    renalFunctionOptions: [
      { value: 'normal', label: 'Нормальная функция почек' },
      { value: 'mild', label: 'Легкая почечная недостаточность' },
      { value: 'moderate', label: 'Умеренная почечная недостаточность' },
      { value: 'severe', label: 'Тяжелая почечная недостаточность' },
    ],
  },
  uk: {
    woundTypeOptions: [
      { value: 'clean', label: 'Чиста рана' },
      { value: 'open-fracture', label: 'Відкритий перелом' },
      { value: 'contaminated', label: 'Контамінована рана' },
      { value: 'bite', label: 'Укус (людина/тварина)' },
      { value: 'water-fresh', label: 'Рана в прісній воді' },
      { value: 'water-salt', label: 'Рана в солоній воді' },
      { value: 'gunshot', label: 'Куляне поранення' },
      { value: 'abdominal', label: 'Проникаюча травма живота' },
      { value: 'crush', label: 'Роздавлююча травма' },
      { value: 'farm', label: 'Фермерська травма' },
    ],
    woundLocationOptions: [
      { value: 'hand-foot', label: 'Кисть/стопа' },
      { value: 'face', label: 'Обличчя' },
      { value: 'perineum', label: 'Промежина' },
      { value: 'groin', label: 'Пахова область' },
      { value: 'armpit', label: 'Пахва' },
      { value: 'joint', label: 'Біля суглоба' },
      { value: 'bone', label: 'Кісткова поверхня' },
      { value: 'other', label: 'Інше' },
    ],
    contaminationTypeOptions: [
      { value: 'none', label: 'Немає забруднення' },
      { value: 'soil', label: 'Грунт/земля' },
      { value: 'feces', label: 'Фекалії' },
      { value: 'saliva', label: 'Слина' },
      { value: 'foreign-body', label: 'Стороннє тіло' },
      { value: 'high-energy', label: 'Високоенергетична травма' },
      { value: 'crush-injury', label: 'Роздавлююча травма' },
    ],
    renalFunctionOptions: [
      { value: 'normal', label: 'Нормальна функція нирок' },
      { value: 'mild', label: 'Легка ниркова недостатність' },
      { value: 'moderate', label: 'Помірна ниркова недостатність' },
      { value: 'severe', label: 'Важка ниркова недостатність' },
    ],
  },
}; 