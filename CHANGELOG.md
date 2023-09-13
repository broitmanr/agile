# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2022-06-22

### Added

-   Se elevo la metrica de performance de 78 a un 97 puntos, introduciendo Grunt al proceso de build y asi reducir el tamaño de los css.

    Grunt solo esta pensado para ser ejecutado durante el build de CI/CD
    con lo cual las clases CSS en local siguen siendo las completas.

-   Se realizaron ajustes visuales para mejorar la accesibilidad y llevar la metrica a 100 puntos

-   Se introdujeron nuevos tests unitarios en el modelo y al router. Se mejoraron los siguientes porcentajes de coverage

    Product.js: 72% al 100% 
    Cart.js: 78% al 100%
    Router.js: 55% al 93.1%

-   Se introdujeron Best Practices arrojadas por la herramienta elevando la metrica de 83 a 100 puntos

    Se introdujo una imagen creada a partir de un SVG, que no se distorciona al variar de tamaño.
    Ademas se ajusto la proporsion de la misma

## [1.0.0] - 2022-05-26

### Added

-   Modelos de Producto y Carrito
-   Vistas de Home y Carrito
-   Tests unitarios, de integración y e2e
-   Metricas con lighthouse

[unreleased]: https://github.com/frlp-utn-ingsoft/shopp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/frlp-utn-ingsoft/shopp/releases/tag/v1.0.0
