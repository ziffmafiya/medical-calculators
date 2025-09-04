# Руководство по разработке

## Добавление нового калькулятора

### 1. Создание типов

Добавьте типы в `src/types/index.ts`:

```typescript
export interface NewCalculatorInputs {
  // Определите входные параметры
  parameter1: number;
  parameter2: string;
  // ...
}

export interface NewCalculatorResult {
  // Определите результат расчета
  result1: number;
  result2: string;
  // ...
}
```

### 2. Создание компонента калькулятора

Создайте файл `src/calculators/NewCalculator.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { NumberInput } from '@/components/NumberInput';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { NewCalculatorInputs, NewCalculatorResult } from '@/types';

export const NewCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<NewCalculatorInputs>({
    // Начальные значения
  });

  const [result, setResult] = useState<NewCalculatorResult | null>(null);

  const calculate = () => {
    // Логика расчета
    const calculatedResult: NewCalculatorResult = {
      // Результаты расчета
    };
    
    setResult(calculatedResult);
  };

  const reset = () => {
    setInputs({
      // Сброс к начальным значениям
    });
    setResult(null);
  };

  return (
    <Card title="Название калькулятора" className="max-w-2xl mx-auto">
      {/* Форма ввода */}
      <div className="space-y-6">
        {/* Компоненты ввода */}
        
        <div className="flex space-x-4">
          <Button onClick={calculate} variant="primary">
            Рассчитать
          </Button>
          <Button onClick={reset} variant="outline">
            Сбросить
          </Button>
        </div>

        {/* Отображение результатов */}
        {result && (
          <div className="mt-6 p-4 bg-accent rounded-lg">
            {/* Результаты */}
          </div>
        )}
      </div>
    </Card>
  );
};
```

### 3. Добавление в главную страницу

Обновите `src/app/page.tsx`:

```typescript
// Добавьте импорт
import { NewCalculator } from '@/calculators/NewCalculator';

// Добавьте новый тип
type CalculatorType = 'potassium' | 'antibiotic' | 'new';

// Добавьте состояние
const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('potassium');

// Добавьте кнопку навигации
<Button
  onClick={() => setActiveCalculator('new')}
  variant={activeCalculator === 'new' ? 'primary' : 'outline'}
  size="lg"
>
  Новый калькулятор
</Button>

// Добавьте отображение калькулятора
{activeCalculator === 'new' && (
  <div>
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Название калькулятора
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Описание калькулятора
      </p>
    </div>
    <NewCalculator />
  </div>
)}
```

## Стилизация

### Использование Tailwind CSS

Проект использует Tailwind CSS с кастомными CSS-переменными:

```css
/* Доступные цвета */
--background: #0a0a0a
--foreground: #ffffff
--card: #1a1a1a
--card-foreground: #ffffff
--border: #2a2a2a
--input: #2a2a2a
--primary: #3b82f6
--primary-foreground: #ffffff
--secondary: #374151
--secondary-foreground: #ffffff
--accent: #1f2937
--accent-foreground: #ffffff
--muted: #374151
--muted-foreground: #9ca3af
```

### Компоненты

Используйте готовые компоненты:
- `Card` - для обертывания калькуляторов
- `NumberInput` - для числового ввода
- `Select` - для выбора из списка
- `Checkbox` - для булевых значений
- `Button` - для кнопок

## Тестирование

### Локальное тестирование

1. Запустите проект: `npm run dev`
2. Откройте http://localhost:3000
3. Протестируйте новый калькулятор

### Проверка сборки

```bash
npm run build
```

### Проверка типов

```bash
npx tsc --noEmit
```

## Медицинская точность

При создании медицинских калькуляторов:

1. **Используйте проверенные источники:**
   - Клинические рекомендации
   - Научные статьи
   - Официальные руководства

2. **Добавьте предупреждения:**
   - О том, что калькулятор для информационных целей
   - О необходимости консультации с врачом

3. **Документируйте источники:**
   - Добавьте ссылки на источники в код
   - Обновите `MEDICAL_REFERENCES.md`

## Структура файлов

```
src/
├── app/                    # Next.js App Router
├── components/            # Переиспользуемые компоненты
├── calculators/           # Калькуляторы
├── types/                 # TypeScript типы
└── utils/                 # Утилиты (если нужны)
```

## Коммиты

Используйте conventional commits:

```bash
feat: add new medical calculator
fix: correct calculation formula
docs: update medical references
style: improve calculator layout
refactor: simplify calculation logic
```

## Pull Request

При создании PR:

1. Опишите изменения
2. Укажите медицинские источники
3. Добавьте скриншоты (если применимо)
4. Убедитесь, что все тесты проходят 