import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

/**
 * @typedef {typeof ROUTES_PATH} IPath
 * @typedef {import("../app/Router.js").navigateCallback} navigateCallback
 */

export default class NewBill {
  /**
   * NewBill constructor
   * @param {Object} param0
   * @param {Document} param0.document
   * @param {navigateCallback} param0.onNavigate
   * @param {import("../app/Store").default} param0.store
   * @param {Storage} param0.localStorage
   */
  constructor({
    document: l_document,
    onNavigate,
    store,
    localStorage: l_localStorage,
  }) {
    this.document = l_document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener('submit', this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener('change', this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({
      document: l_document,
      localStorage: l_localStorage,
      onNavigate,
    });
  }
  /**
   * 
   * @param {InputEvent} e 
   */
  handleChangeFile = async (e) => {
    try {
      e.preventDefault();
      /** @type {HTMLInputElement} */
      const input = this.document.querySelector(`input[data-testid="file"]`);
      const file = input?.files?.[0];
      await this.handleChangeFileLogic(input, file);
    } catch (error) {
      console.error(error);
    }
  };
  handleChangeFileLogic = async (input, logic_file) => {
    try {
      if (['image/png', 'image/jpeg'].includes(logic_file.type)) {
        const filePath = input.value.split(/\\/g);
        const fileName = filePath[filePath.length - 1];
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem('user')).email;
        formData.append('file', logic_file);
        formData.append('email', email);

        const { fileUrl, key } = await this.store.bills().create({
          data: formData,
          headers: {
            noContentType: true,
          },
        });

        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;


      } else {
        
        input.value = '';
        this.fileUrl = null;
        this.fileName = null;

        input.setCustomValidity('Please upload a valid image file .jpg, .jpeg or .png');
        input.reportValidity();
        setTimeout(() => input.setCustomValidity(''), 5100);
        throw 'Invalid file type';
      }

    } catch (error) {
      console.error(logic_file.type);
      console.error(error);
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem('user')).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending',
    };
    if (bill.amount && bill.date && bill.pct && this.fileUrl) {
      this.updateBill(bill);
      this.onNavigate(ROUTES_PATH['Bills']);
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch((error) => console.error(error));
    }
  };
}
