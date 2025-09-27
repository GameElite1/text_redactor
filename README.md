[![Build and Test](https://github.com/GameElite1/text_redactor/actions/workflows/npm-grunt.yml/badge.svg)](https://github.com/GameElite1/text_redactor/actions/workflows/npm-grunt.yml)
# This file is only for editing file nodes, do not break the structure
## Project Description
Расширенный текстовый редактор с функциями форматирования, поиска, проверки орфографии и полноценной системой безопасности. Профессиональный инструмент для создания и редактирования текстовых документов с административной панелью и управлением пользователями.

## Key Features
- ✅ Создание, редактирование и сохранение текста с автосохранением каждые 30 секунд
- ✅ Загрузка и скачивание файлов (.txt, .md, .json)
- ✅ Поиск и замена текста с визуальным подсвечиванием совпадений
- ✅ Форматирование выделенного текста (шрифт, размер, цвет, жирный, курсив, подчеркивание)
- ✅ Проверка орфографии с базовыми правилами русского языка
- ✅ Статистика документа (слова, символы) в реальном времени
- ✅ Горячие клавиши (Ctrl+S сохранение, Ctrl+B/I/U форматирование)
- ✅ Корректная работа курсора при вводе текста с сохранением позиции
- ✅ Система аутентификации: логин/пароль + email авторизация
- ✅ Панель администратора с управлением пользователями
- ✅ Роли пользователей (администратор/пользователь)
- ✅ Демо админ аккаунт: admin/admin
- ✅ Добавление, редактирование, удаление пользователей
- ✅ Статистика активности и безопасности

## Data Storage
Local Storage: 
- Zustand persist для автосохранения документов в localStorage
- Настройки форматирования и пользовательские настройки
- Журнал безопасности и активности пользователей
- Данные управления пользователями

Database: Готово к интеграции с Devv SDK для облачного хранения документов

## Devv SDK Integration
Built-in: Система аутентификации через email OTP готова к интеграции
External: Пока не используется

## Special Requirements
- Поддержка русского языка и орфографии
- Автосохранение для предотвращения потери данных
- Интуитивный интерфейс редактора с панелями форматирования
- Форматирование применяется только к выделенному тексту
- Корректная работа курсора при печати с сохранением позиции
- Полная система безопасности с ролями и административной панелью
- Демонстрационная учетная запись администратора

## File Structure

/src
├── assets/          # Static resources directory
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components
│   ├── Toolbar.tsx # Панель инструментов с индикатором роли пользователя и кнопкой админ панели
│   ├── RichTextEditor.tsx # Основной редактор с исправленной работой курсора и форматированием
│   ├── StatusBar.tsx # Строка состояния с статистикой
│   ├── SearchPanel.tsx # Панель поиска и замены с визуальным выделением
│   ├── FormattingToolbar.tsx # Панель форматирования для выделенного текста
│   ├── SpellChecker.tsx # Компонент проверки орфографии русского языка
│   ├── AuthWrapper.tsx # Обертка аутентификации
│   ├── LoginForm.tsx # Форма входа с поддержкой логин/пароль + email
│   ├── ProtectedRoute.tsx # Защищенные маршруты
│   └── AdminPanel.tsx # Полноценная панель администратора с управлением пользователями
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Mobile detection Hook
│   ├── use-toast.ts  # Toast notification system Hook
│   ├── use-file-operations.ts # Операции с файлами (создание, сохранение, загрузка)
│   ├── use-auto-save.ts # Хук автосохранения
│   ├── use-auth.ts # Хук аутентификации с поддержкой SDK
│   └── use-security-logger.ts # Логирование безопасности
│
├── lib/            # Utility library directory
│   └── utils.ts    # Utility functions, including cn function for merging Tailwind classes
│
├── pages/          # Page components directory (React Router structure)
│   ├── HomePage.tsx # Главная страница с полным интерфейсом редактора
│   └── NotFoundPage.tsx # 404 error page
│
├── store/          # State management directory (Zustand)
│   ├── editor-store.ts # Состояние редактора с persist для автосохранения
│   ├── formatting-store.ts # Состояние форматирования (шрифт, цвет, стили)
│   ├── auth-store.ts # Состояние аутентификации с поддержкой ролей
│   ├── security-store.ts # Журнал безопасности и логирование
│   └── users-store.ts # Управление пользователями для админ панели
│
├── App.tsx         # Root component с интеграцией админ панели и системы безопасности
│
├── main.tsx        # Entry file, renders root component and mounts to DOM
│
├── index.css       # Global styles file with comprehensive design system
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
