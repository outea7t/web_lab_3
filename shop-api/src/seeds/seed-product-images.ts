// src/seeds/seed-product-images.ts
import 'dotenv/config';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Sequelize } from 'sequelize-typescript';

import { Product } from '../products/product.model';
import type { ProductCategory } from 'src/products/types/product.types';
import { ProductImage } from '../products/product-image.model';
import { ProductProperty } from '../products/product-property.model';

type SeedProduct = {
  id: `p${number}`;
  title: string;
  subtitle: string;
  price: number;
  img: string;
  desc: string;
  specs: string[];
};

const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: 'p1',
    title: 'Ботинки мужские Classic',
    subtitle: 'Универсальные для межсезонья',
    price: 4990,
    img: 'products/product-1.png',
    desc: 'Верх — эко-кожа, подклад — текстиль, подошва — ТПР. Подходят для повседневной носки.',
    specs: [
      'Материал верха: эко-кожа',
      'Подошва: ТПР',
      'Сезон: демисезон',
    ],
  },
  {
    id: 'p2',
    title: 'Кеды мужские Street',
    subtitle: 'Лёгкие на каждый день',
    price: 3290,
    img: 'products/product-2.png',
    desc: 'Дышащий верх, гибкая подошва, комфортная посадка.',
    specs: [
      'Материал верха: текстиль',
      'Стелька: съёмная',
      'Застёжка: шнуровка',
    ],
  },
  {
    id: 'p3',
    title: 'Туфли мужские Oxford',
    subtitle: 'Классика для офиса',
    price: 5490,
    img: 'products/product-3.png',
    desc: 'Строгий силуэт, практичные материалы, комфорт на весь день.',
    specs: [
      'Материал верха: эко-кожа',
      'Подклад: текстиль',
      'Подошва: ТПР',
    ],
  },
  {
    id: 'p4',
    title: 'Кроссовки женские LightRun',
    subtitle: 'Дышащие и амортизирующие',
    price: 3790,
    img: 'products/product-4.png',
    desc: 'Дышащий верх, амортизация, классическая шнуровка.',
    specs: [
      'Верх: дышащий текстиль',
      'Амортизация: облегчённая',
      'Застёжка: шнуровка',
    ],
  },
  {
    id: 'p5',
    title: 'Босоножки женские Breeze',
    subtitle: 'Лёгкие на каждый день',
    price: 2990,
    img: 'products/product-5.png',
    desc: 'Лёгкая модель на каждый день, мягкая стелька.',
    specs: [
      'Стелька: мягкая',
      'Подошва: лёгкая',
      'Ремешки: регулируемые',
    ],
  },
  {
    id: 'p6',
    title: 'Ботильоны женские City',
    subtitle: 'Удобная колодка на межсезонье',
    price: 4590,
    img: 'products/product-6.png',
    desc: 'Универсальная модель для межсезонья. Удобная колодка.',
    specs: [
      'Сезон: демисезон',
      'Колодка: комфортная',
      'Высота: до щиколотки',
    ],
  },
  {
    id: 'p7',
    title: 'Подпятник кожаный',
    subtitle: 'Удобство и защита пятки',
    price: 70,
    img: 'products/product-7.png',
    desc: 'Натуральная кожа.',
    specs: [
      'Материал: натуральная кожа',
      'Назначение: защита и комфорт пятки',
      'Крепление: клеевое',
    ],
  },
  {
    id: 'p8',
    title: 'Носки хлопковые (5 пар)',
    subtitle: 'Набор базовых на каждый день',
    price: 590,
    img: 'products/product-8.png',
    desc: '95% хлопок, комфортная резинка, унисекс.',
    specs: [
      'Состав: 95% хлопок',
      'Комплект: 5 пар',
      'Тип: унисекс',
    ],
  },
  {
    id: 'p9',
    title: 'Вкладыш в сапог ABB',
    subtitle: 'Форма и аккуратность сапог',
    price: 35,
    img: 'products/product-9.png',
    desc: 'Помогает держать форму обуви.',
    specs: [
      'Назначение: поддержка голенища сапога',
      'Размер: универсальный',
      'Материал: пластик',
    ],
  },
];

async function main() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: [Product, ProductProperty, ProductImage],
    logging: false,
  });

  // Чтобы колонка category гарантированно появилась (dev-вариант)
  await sequelize.sync({ alter: true });

  // 1. Сидируем товары
  for (const seed of SEED_PRODUCTS) {
    const index = Number(seed.id.slice(1)); // 1..9

    const category: ProductCategory =
      index <= 3 ? 'men' : index <= 6 ? 'women' : 'accessories';

    const categoryRu =
      category === 'men'
        ? 'мужская обувь'
        : category === 'women'
        ? 'женская обувь'
        : 'аксессуары';

    // условно: 1 — обувь, 2 — аксессуары
    const isAccessory = category === 'accessories';
    const manufacturerId = isAccessory ? 2 : 1;

    const [product, created] = await Product.findOrCreate({
      where: { alias: seed.id }, // alias = "p1", "p2" и т.п.
      defaults: {
        manufacturerId,
        name: seed.title,
        alias: seed.id,
        shortDescription: seed.subtitle,
        description: seed.desc,
        price: seed.price,
        image: seed.img,
        category,
        available: 1,
        metaKeywords: `${seed.title}, ${seed.subtitle}, ${categoryRu}`,
        metaDescription: `${seed.subtitle}. ${seed.desc} (${categoryRu})`,
        metaTitle: `${seed.title} — ${categoryRu} — интернет-магазин Сити Класс`,
      },
    });

    console.log(
      created
        ? `Создан товар "${product.name}" (id=${product.id}, category=${category})`
        : `Товар "${product.name}" уже существует (id=${product.id}), пропускаю создание`,
    );

    // 2. Сидируем характеристики (specs) в product_properties
    for (const spec of seed.specs) {
      const [rawName, rawValue] = spec.split(':');
      const propertyName = rawName?.trim();
      const propertyValue = rawValue?.trim();

      if (!propertyName || !propertyValue) {
        console.warn(`Не удалось распарсить спецификацию "${spec}", пропускаю`);
        continue;
      }

      const [, propCreated] = await ProductProperty.findOrCreate({
        where: {
          productId: product.id,
          propertyName,
          propertyValue,
        },
        defaults: {
          productId: product.id,
          propertyName,
          propertyValue,
          propertyPrice: 0.00, // нет надбавки к цене
        },
      });

      if (propCreated) {
        console.log(
          `  + добавлено свойство "${propertyName}: ${propertyValue}"`,
        );
      }
    }
  }

  // 3. Сидируем картинки в product_images
  const imagesDir = join(__dirname, '..', '..', 'public', 'products');
  const files = readdirSync(imagesDir).filter((f) => f.endsWith('.png'));

  for (const file of files) {
    const match = file.match(/^product-(\d+)\.png$/);
    if (!match) {
      console.warn(
        `Пропускаю файл "${file}" — имя не подходит под шаблон product-X.png`,
      );
      continue;
    }

    const index = Number(match[1]); // 1..9
    const alias = `p${index as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

    const product = await Product.findOne({ where: { alias } });
    if (!product) {
      console.warn(`Товар с alias="${alias}" не найден, пропускаю "${file}"`);
      continue;
    }

    const relativePath = `products/${file}`;

    const [image, imageCreated] = await ProductImage.findOrCreate({
      where: { productId: product.id, image: relativePath },
      defaults: {
        productId: product.id,
        image: relativePath, 
        title: product.name,
      },
    });

    if (imageCreated) {
      console.log(
        `Создан ProductImage для productId=${product.id}: ${image.image}`,
      );
    } else {
      console.log(
        `Картинка для productId=${product.id} (${image.image}) уже есть, пропускаю`,
      );
    }
  }

  await sequelize.close();
  console.log('Сидер товаров, характеристик, категорий и изображений выполнен.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
