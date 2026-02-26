---
name: ui-ux-pro-max
description: >
  Mecanismo de busca semantica baseado em BM25 para guias de estilo UI/UX,
  paletas de cores, combinacoes tipograficas, padroes de graficos, diretrizes UX,
  e melhores praticas em React especificas da stack.
  Gera sistemas de design completos (cores, tipografia, layout, efeitos)
  a partir de uma query em linguagem natural. Use sempre que tomar decisoes de UI/UX,
  antes de projetar componentes ou quando o usuario perguntar sobre estilo/design.
skills:
  - frontend-design
---

# UI/UX Pro Max Skill

## Proposito

Esta skill fornece um **mecanismo de sistema de design orientado a dados** construido sobre bancos de dados CSV curados cobrindo:

| Domain       | File                    | O que cobre                                                               |
| ------------ | ----------------------- | ------------------------------------------------------------------------- |
| `style`      | `styles.csv`            | Estilos de design (glassmorphism, neumorphism, minimalismo, dark mode...) |
| `color`      | `colors.csv`            | Paletas de cores por tipo de produto (SaaS, fintech, e-commerce...)       |
| `typography` | `typography.csv`        | Combinacoes de fontes + URLs do Google Fonts + imports CSS                |
| `chart`      | `charts.csv`            | Melhor tipo de grafico por tipo de dados + recomendacoes de biblioteca    |
| `landing`    | `landing.csv`           | Padroes de landing page + posicionamento de CTA + otimizacao de conversao |
| `product`    | `products.csv`          | Recomendacoes de design por categoria de produto                          |
| `ux`         | `ux-guidelines.csv`     | Regras do/don't de UX por categoria com severidade                        |
| `react`      | `react-performance.csv` | Anti-padroes de otimizacao em React/Next.js                               |
| `web`        | `web-interface.csv`     | Diretrizes de acessibilidade e HTML semantico de interface web            |
| `icons`      | `icons.csv`             | Recomendacoes de bibliotecas de icones por categoria                      |
| `prompt`     | `prompts.csv`           | Prompts de IA prontas para copiar e colar por estilo de design            |
| **stacks**   | `stacks/*.csv`          | Diretrizes especificas da stack: React + Vite, TailwindCSS                |

---

## Como Usar

### 1. Pesquisar um dominio especifico

```bash
cd .agent/skills/ui-ux-pro-max/scripts
python search.py "dashboard financial SaaS" --domain style
python search.py "dark mode glassmorphism" --domain color
python search.py "mobile touch target" --domain ux
python search.py "useEffect optimization" --domain react
python search.py "font pairing professional" --domain typography
```

### 2. Pesquisar diretrizes especificas da stack

```bash
# Stacks disponíveis para o Nexus-Arqui: react, html-tailwind
python search.py "component pattern" --stack react
python search.py "utility class layout" --stack html-tailwind
```

### 3. Gerar um Sistema de Design completo (recomendado antes de qualquer tarefa de UI)

```bash
# Saida rapida em ASCII (para consumo do agente)
python search.py "SaaS dashboard" --design-system -p "Nexus-Arqui"

# Saida Markdown
python search.py "SaaS financial ERP" --design-system -p "Nexus-Arqui" --format markdown

# Persistir em arquivos (padrao Master + Page Overrides)
python search.py "SaaS ERP" --design-system -p "Nexus-Arqui" --persist
python search.py "dashboard" --design-system -p "Nexus-Arqui" --persist --page "dashboard"
```

---

## Protocolo de Integracao (Uso do Agente)

> **OBRIGATORIO:** Antes de qualquer implementacao de UI/componente no Nexus-Arqui, rode:
>
> ```bash
> cd .agent/skills/ui-ux-pro-max/scripts
> python search.py "SaaS ERP financial dashboard" --design-system -p "Nexus-Arqui" --format markdown
> ```
>
> Use a saida para guiar decisoes de cores, tipografia, espacamento e efeitos.

### Quando chamar esta skill

| Trigger                               | Command                             |
| ------------------------------------- | ----------------------------------- |
| Projetando uma nova pagina/componente | `--design-system`                   |
| Escolhendo tokens de cores            | `--domain color`                    |
| Selecionando tipografia/fontes        | `--domain typography`               |
| Revisando performance do React        | `--domain react` or `--stack react` |
| Verificando melhores praticas de UX   | `--domain ux`                       |
| Selecionando biblioteca de icones     | `--domain icons`                    |

---

## Checklist Pre-Entrega (Sempre Aplique)

- [ ] Sem emojis como icones - use SVG (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast **4.5:1 minimum**
- [ ] Estados de foco visiveis para navegacao por teclado
- [ ] `prefers-reduced-motion` respected
- [ ] Breakpoints responsivos: 375px, 768px, 1024px, 1440px
- [ ] Nenhum conteudo escondido atras de navbars fixas
- [ ] Sem scroll horizontal em dispositivos moveis

---

## Sistema de Design Base do Nexus-Arqui

Rode o seguinte para regenerar a base deste projeto:

```bash
cd .agent/skills/ui-ux-pro-max/scripts
python search.py "SaaS ERP financial project management" --design-system -p "Nexus-Arqui" --persist --output-dir .agent/skills/ui-ux-pro-max
```

A saida e salva em `.agent/skills/ui-ux-pro-max/design-system/nexus-arqui/MASTER.md`.
