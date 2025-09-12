import chain from '@/assets/chain.png';

const replacers = {
   reference: /{([^}]+)}/g,
   keyword: /\[([^\]]+)\]/g,
   italic: /_([^_]+)_/g,
   bold: /\*([^\*]+)\*/g,
   chain: /(\([Cc]\))/g
};

const chainSize = window.innerWidth <= 750 ? '4vw' : '2vw';
const chainPos = window.innerWidth <= 750 ? '7px' : '10px';

const styles = {
   reference: 'color: #666ffa',
   keyword: 'color: #f1cf57',
   italic: 'font-style: italic',
   bold: 'font-weight: 600',
   chain: `width: ${chainSize}; display: inline; transform: translateY(${chainPos})`,
};

export default function (description) {
   return description
      .replace(/\n/g, '<br />')
      .replace(replacers.reference, `<span style="${styles.reference}">$1</span>`)
      .replace(replacers.keyword, `<span style="${styles.keyword}">$1</span>`)
      .replace(replacers.italic, `<span style="${styles.italic}">$1</span>`)
      .replace(replacers.bold, `<span style="${styles.bold}">$1</span>`)
      .replace(replacers.chain, `<img style="${styles.chain}" src="${chain}" alt="chain icon" />`);
}
