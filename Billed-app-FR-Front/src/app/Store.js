
/**
 * 
 * @param {Response} response 
 * @returns {Promise<any>}
 */
const jsonOrThrowIfError = async (response) => {
  if(!response.ok) throw new Error((await response.json()).message)
  return response.json()
}

class Api {
  /**
   * Api constructor
   * @param {{baseUrl: string}} param0 
   */
  constructor({baseUrl}) {
    this.baseUrl = baseUrl;
  }
  /**
   * Get data from the API
   * @param {{url: string, headers?: HeadersInit}} param0 
   * @returns {Promise<any>}
   */
  async get({url, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'GET'}))
  }
  /**
   * Post data to the API
   * @param {{url:string, data: BodyInit, headers?: HeadersInit}} param0 
   * @returns {Promise<any>}
   */
  async post({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'POST', body: data}))
  }
  /**
   * Delete data from the API
   * @param {{url: string, headers?: HeadersInit}} param0 
   * @returns {Promise<any>}
   */
  async delete({url, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'DELETE'}))
  }
  /**
   * Update data from the API
   * @param {{url:string, data: any, headers?: HeadersInit}} param0 
   * @returns {Promise<any>}
   */
  async patch({url, data, headers}) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, {headers, method: 'PATCH', body: data}))
  }
}

/**
 * 
 * @param {Record<string, any>} [headers] 
 * @returns {HeadersInit}
 */
const getHeaders = (headers) => {
  const h = { }
  if (!headers.noContentType) h['Content-Type'] = 'application/json'
  const jwt = localStorage.getItem('jwt')
  if (jwt && !headers.noAuthorization) h['Authorization'] = `Bearer ${jwt}`
  return {...h, ...headers}
}

class ApiEntity {
  /**
   * 
   * @param {{key:string, api: Api}} param0 
   */
  constructor({key, api}) {
    this.key = key;
    this.api = api;
  }
  /**
   * Return a single entity
   * @param {{selector:string, headers?:Record<string, string>}} param0 
   * @returns 
   */
  async select({selector, headers = {}}) {
    return await (this.api.get({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
  /**
   * Return all entities
   * @param {{headers?:Record<string, string>}} [param0]
   * @returns 
   */
  async list(param0) {
    return await (this.api.get({url: `/${this.key}`, headers: getHeaders(param0?.headers || {})}))
  }
  /**
   * Update an entity
   * @param {{data: any, selector:string, headers?: Record<string, string>}} param0 
   * @returns 
   */
  async update({data, selector, headers = {}}) {
    return await (this.api.patch({url: `/${this.key}/${selector}`, data, headers: getHeaders(headers)}))
  }
  /**
   * Create an entity
   * @param {{data:any, headers?:Record<string, any>}} param0 
   * @returns 
   */
  async create({data, headers = {}}) {
    return await (this.api.post({url: `/${this.key}`, data, headers: getHeaders(headers), }))
  }
  /**
   * Delete an entity
   * @param {{selector:string, headers?: Record<string, string>}} param0 
   * @returns 
   */
  async delete({selector, headers = {}}) {
    return await (this.api.delete({url: `/${this.key}/${selector}`, headers: getHeaders(headers)}))
  }
}



class Store {
  constructor() {
    this.api = new Api({baseUrl: 'http://localhost:5678'})
  }

  /**
   * Get an user by id
   * @param {string} uid 
   * @returns 
   */
  user = uid => (new ApiEntity({ key: 'users', api: this.api })).select({ selector: uid })
  /**
   * Get all users
   * @returns 
   */
  users = () => new ApiEntity({ key: 'users', api: this.api })
  /**
   * Login to an user account
   * @param {any} data 
   * @returns 
   */
  login = (data) => this.api.post({url: '/auth/login', data, headers: getHeaders({noAuthorization: true})})

  //ref = (path) => this.store.doc(path)

  /**
   * Get an bill by id
   * @param {string} bid Bill id
   * @returns 
   */
  bill = bid => (new ApiEntity({ key: 'bills', api: this.api })).select({ selector: bid })
  /**
   * Get all bills
   */
  bills = () => new ApiEntity({key: 'bills', api: this.api})
}

export default new Store()