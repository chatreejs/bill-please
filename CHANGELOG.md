# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.3] - 2025-11-30

### Changed

- Upgrade dependencies:
  - axios: 1.8.2 → 1.12.0 ([#24](https://github.com/chatreejs/bill-please/pull/24))
  - vite: 6.2.7 → 6.4.1
  - js-yaml: 4.1.0 → 4.1.1
  - form-data: 4.0.2 → 4.0.4 ([#21](https://github.com/chatreejs/bill-please/pull/21))
- Bump GitHub Actions:
  - actions/checkout: 4 → 6
  - github/codeql-action: 3 → 4

### Fixed

- Update setup instructions to reflect correct project name

### Added

- Add CodeQL badge to documentation

## [0.7.2] - 2025-06-11

### Added

- Add remark text for service charge and VAT.
- Add vercel speed insights.

### Fixed

- Fix payer and price not display correctly

### Changed

- Item quantity in result page is divided by payer count.

## [0.7.1] - 2025-03-06

### Changed

- Upgrade dependencies: react, react-dom, vite-tsconfig-paths

## [0.7.0] - 2025-03-06

### Added

- Check for update mechanism.

## [0.6.0] - 2025-03-06

### Added

- Clear bill button

### Changed

- Upgrade dependencies: vite, @fontsource, vite-plugin-pwa, i18n

## [0.5.1] - 2025-01-16

### Added

- English translation.
- Thai translation.

### Fixed

- Fix missing service charge, VAT, and subtotal in the receipt.
- Fix item mapping label missing when de-select all payer.

## [0.5.0] - 2025-01-16

### Added

- Service charge calculation for each item.
- VAT calculation for each item.
- Total amount calculation for each item.
- Display service charge, VAT, and total amount for each item.

## [0.4.5] - 2024-09-09

**Full Changelog**: https://github.com/chatreejs/bill-please/commits/v0.4.5

[0.7.3]: https://github.com/chatreejs/bill-please/compare/v0.7.3...v0.7.2
[0.7.2]: https://github.com/chatreejs/bill-please/compare/v0.7.2...v0.7.1
[0.7.1]: https://github.com/chatreejs/bill-please/compare/v0.7.1...v0.7.0
[0.7.0]: https://github.com/chatreejs/bill-please/compare/v0.7.0...v0.6.0
[0.6.0]: https://github.com/chatreejs/bill-please/compare/v0.6.0...v0.5.1
[0.5.1]: https://github.com/chatreejs/bill-please/compare/v0.5.1...v0.5.0
[0.5.0]: https://github.com/chatreejs/bill-please/compare/v0.5.0...v0.4.5
[0.4.5]: https://github.com/chatreejs/bill-please/releases/tag/v0.4.5
