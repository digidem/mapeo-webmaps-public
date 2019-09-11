const html = require('choo/html')
const css = require('sheetify')

const className = css`
  :host,
  :host aside,
  :host section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  :host {
    height: 100%;
    width: 100%;
  }

  :host aside {
    background: #000;
    flex-shrink: 1;
    padding: 30px 20px;
  }

  :host aside p {
    margin: 0;
    color: #999999;
    font-size: 14px;
    line-height: 24px;
  }

  :host aside a {
    color: #fff;
    text-decoration: none;
  }

  :host section span {
    font-size: 24px;
    font-weight: 500;
    display: block;
    border-bottom: 1px solid #eaeaea;
    text-align: center;
    padding-bottom: 20px;
    width: 100px;
  }

  :host section p {
    font-size: 14px;
    font-weight: 400;
  }

  :host section span + p {
    margin: 20px 0 0 0;
  }

  @media (min-width: 768px) {
    :host section {
      height: 40px;
      flex-direction: row;
    }

    :host section span,
    :host section p {
      height: 100%;
      line-height: 40px;
    }

    :host section span {
      border-bottom: 0;
      border-right: 1px solid #eaeaea;
      padding: 0 20px 0 0;
      width: auto;
    }

    :host section span + p {
      margin: 0;
      padding-left: 20px;
    }

    :host aside {
      padding: 50px 0;
    }

    :host aside p {
      max-width: 520px;
      text-align: center;
    }
  }
`

module.exports = function () {
  return function () {
    return html`
      <div class="${className}">
        <section>
          <span>404</span>
          <p>Page Not Found</p>
        </section>
      </div>
    `
  }
}
