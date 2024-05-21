const replacers = {
   keyword: /\[([^\]]+)\]/g,
   italic: /_([^_]+)_/g,
   bold: /\*([^\*]+)\*/g,
};

const styles = {
   keyword: 'color: #dec34f',
   italic: 'font-style: italic',
   bold: 'font-weight: 600',
};

export default function (description) {
   return description
      .replace(/\n/g, '<br />')
      .replace(replacers.keyword, `<span style="${styles.keyword}">$1</span>`)
      .replace(replacers.italic, `<span style="${styles.italic}">$1</span>`)
      .replace(replacers.bold, `<span style="${styles.bold}">$1</span>`)
}
