import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

/**
 * @typedef {typeof ROUTES_PATH} IPath
 * @typedef {import('../__mocks__/store.js').IBillObject} IBillObject
 * @typedef {import("../app/Router.js").navigateCallback} navigateCallback
 */

/**
 * Filter bills by status
 * @param {IBillObject[]} data 
 * @param {"pending" | "accepted" | "refused"} status 
 * @returns {IBillObject[]}
 */
export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

/**
 * Transform a bill object to a bill UI object
 * @param {IBillObject} bill 
 * @returns {string}
 */
export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

/**
 * Transform bills to cards
 * @param {IBillObject[]} bills 
 * @returns {string}
 */
export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

/**
 * Get a status associated to a index
 * @param {number} index 
 * @returns {"pending" | "accepted" | "refused"}
 */
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
    /**
   * Bills constructor
   * @param {Object} param0
   * @param {Document} param0.document
   * @param {navigateCallback} param0.onNavigate
   * @param {IBillObject[]} param0.bills
   * @param {import("../app/Store").default} param0.store
   * @param {Storage} param0.localStorage
   */
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    $('#arrow-icon1').on("click",(e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').on("click",(e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').on("click",(e) => this.handleShowTickets(e, bills, 3))
    new Logout({document, onNavigate, localStorage })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center; width: 100%'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  /**
   * 
   * @param {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} e 
   * @param {IBillObject} bill 
   * @param {IBillObject[]} bills 
   */
  handleEditTicket(e, bill, bills) {
    if (this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter++
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })
      
      $('.dashboard-right-container div').html(`
      <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter++
    }
    $('#icon-eye-d').on("click",this.handleClickIconEye)
    $('#btn-accept-bill').on("click",(e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').on("click",(e) => this.handleRefuseSubmit(e, bill))
  }

  /**
   * 
   * @param {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} e 
   * @param {IBillObject} bill 
   */
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: String($('#commentary2').val())
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  /**
   * 
   * @param {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} e 
   * @param {IBillObject} bill 
   */
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: String($('#commentary2').val())
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  /**
   * 
   * @param {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>} e 
   * @param {IBillObject[]} bills 
   * @param {number} index 
   */
  handleShowTickets(e, bills, index) {
    if (this.listToggle === undefined) this.listToggle = new Map()
    if (this.index === undefined || this.index !== index) this.index = index
    if (!this.listToggle.get(index)) {
      const fBill = filteredBills(bills, getStatus(this.index));

      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)'})
      $(`#status-bills-container${this.index}`).html(cards(fBill))
      
      fBill.forEach(bill => {
        $(`#open-bill${bill.id}`).on("click",(e) => this.handleEditTicket(e, bill, bills))
      })
      
      this.listToggle.set(index, true)
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)'})
      $(`#status-bills-container${this.index}`)
      .html("")
      this.listToggle.set(index, false)
    }

    return bills

  }

  /**
   * Get all bills of all users
   * @returns {Promise<IBillObject[]>}
   */
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error;
      })
    }
  }

  /**
   * Update a bill
   * not need to cover this function by tests (istanbul ignore next)
   * @param {IBillObject} bill 
   * @returns 
   */
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
