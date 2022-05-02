
import { ROUTES_PATH } from '../constants/routes.js'

/**
 * @typedef {typeof ROUTES_PATH} IPath
 * @typedef {import("../app/Router.js").navigateCallback} navigateCallback
 */

/**
 * @typedef {Object} ILogout
 * @property {Document} document
 * @property {navigateCallback} onNavigate
 * @property {Storage} localStorage
 */

export default class Logout {
  /**
   * Logout constructor
   * @param {ILogout} param0 
   */
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    $('#layout-disconnect').on("click", this.handleClick)
  }
  
  handleClick = (e) => {
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 