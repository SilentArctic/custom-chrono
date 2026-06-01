import chain from '@/assets/chain.png';

const replacers = {
   reference: /{([^}]+)}/g,
   keyword: /\[([^\]]+)\]/g,
   timeline: /\$([^\$]+)\$/g,
   italic: /_([^_]+)_/g,
   bold: /\*([^\*]+)\*/g,
   chain: /@/g
};

const styles = {
   reference: 'color: #8a8fc1',
   keyword: 'color: #f1cf57',
   timeline: 'color: #7ed1f5',
   italic: 'font-style: italic',
   bold: 'font-weight: 600',
   /* em-based so the icon tracks the surrounding (card-relative) text size */
   chain: 'width: 1.15em; display: inline-block; vertical-align: -0.18em',
};

export default function (description) {
   return description
      .replace(/\n/g, '<br />')
      .replace(replacers.reference, `<span style="${styles.reference}">$1</span>`)
      .replace(replacers.keyword, `<span style="${styles.keyword}">$1</span>`)
      .replace(replacers.timeline, `<span style="${styles.timeline}">$1</span>`)
      .replace(replacers.italic, `<span style="${styles.italic}">$1</span>`)
      .replace(replacers.bold, `<span style="${styles.bold}">$1</span>`)
      .replace(replacers.chain, `<img style="${styles.chain}" src="${chain}" alt="chain icon" />`);
}
