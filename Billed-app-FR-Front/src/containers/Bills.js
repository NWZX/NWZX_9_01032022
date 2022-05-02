
import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from '../app/format.js';
import Logout from './Logout.js';

/**
 * @typedef {typeof ROUTES_PATH} IPath
 * @typedef {import('../__mocks__/store.js').IBillObject} IBillObject
 * @typedef {import("../app/Router.js").navigateCallback} navigateCallback
 */

export default class {
  /**
   * Bills constructor
   * @param {Object} param0
   * @param {Document} param0.document
   * @param {navigateCallback} param0.onNavigate
   * @param {import("../app/Store").default} param0.store
   * @param {Storage} param0.localStorage
   */
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener('click', this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener('click', () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute('data-bill-url');
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
    $('#modaleFile')
      .find('.modal-body')
      .html(
        `<div style='text-align: center; width: 100%' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
    );
    $('#modaleFile').modal('show');
  };

  /**
   * Get bills and format them
   * @returns {Promise<IBillObject[]>}
   */
  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(
          /**
           *
           * @param {IBillObject[]} snapshot
           * @returns {IBillObject[]}
           */
          (snapshot) => {
            const bills = snapshot.map((doc) => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                console.log(e, 'for', doc);
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            });
            console.log('length', bills.length);
            return bills;
          }
        );
    }
  };
}
