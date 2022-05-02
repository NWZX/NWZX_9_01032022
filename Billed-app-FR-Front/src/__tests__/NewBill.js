/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import * as fs from "fs";

jest.mock("../app/Store.js", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then go nowhere", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();

      const store = null
      const billsObj = new NewBill({ document, onNavigate, store, localStorage })
      const handleSubmit = jest.fn(billsObj.handleSubmit)
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      const newBill = screen.getByTestId('btn-send-bill')
      userEvent.click(newBill)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })
})
describe("When I am on NewBill Page Valid Data", () => {
  test("Then go nowhere here", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    document.body.innerHTML = NewBillUI();


    const store = mockStore;
    const billsObj = new NewBill({ document, onNavigate, store, localStorage })
    const consoleSpy = jest.spyOn(console, "error");
    const form = screen.getByTestId("form-new-bill");
    /**
     * @type {HTMLInputElement}
     */
    const file = form.querySelector(`input[data-testid="file"]`);
    file.dispatchEvent(new Event("change"));
    const data = fs.readFileSync("./src/assets/images/facturefreemobile.jpg");
    const fileAta = new File([data], "facturefreemobile.jpeg", { type: "image/jpeg" });
    await billsObj.handleChangeFileLogic(file, fileAta);

    const handleSubmit = jest.fn(billsObj.handleSubmit)

    const inputAmount = screen.getByTestId("amount");
    fireEvent.change(inputAmount, { target: { value: "12" } });
    expect(inputAmount.value).toBe("12");

    const inputDatepicker = screen.getByTestId("datepicker");
    fireEvent.change(inputDatepicker, {
      target: { value: "2022-04-13" },
    });
    expect(inputDatepicker.value).toBe("2022-04-13");

    const inputPtc = screen.getByTestId("pct");
    fireEvent.change(inputPtc, { target: { value: "40" } });
    expect(inputPtc.value).toBe("40");

    form.addEventListener("submit", handleSubmit);
    const newBill = screen.getByTestId('btn-send-bill')
    userEvent.click(newBill)
    expect(handleSubmit).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
  })
})
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page Invalid Data", () => {
    test("Then go nowhere again", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();

      const store = null;
      const billsObj = new NewBill({ document, onNavigate, store, localStorage })
      const handleSubmit = jest.fn(billsObj.handleSubmit)
      const form = screen.getByTestId("form-new-bill");

      const consoleSpy = jest.spyOn(console, "error");
      /**
       * @type {HTMLInputElement}
       */
      const file = form.querySelector(`input[data-testid="file"]`);
      file.dispatchEvent(new Event("change"));
      await billsObj.handleChangeFileLogic(file, new File([""], "test.pdf", { type: "application/pdf" }));

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: "" } });
      expect(inputAmount.value).toBe("");

      const inputDatepicker = screen.getByTestId("datepicker");
      fireEvent.change(inputDatepicker, {
        target: { value: "2022-04-13" },
      });
      expect(inputDatepicker.value).toBe("2022-04-13");

      const inputPtc = screen.getByTestId("pct");
      fireEvent.change(inputPtc, { target: { value: "40" } });
      expect(inputPtc.value).toBe("40");
      
      form.addEventListener("submit", handleSubmit);
      const newBill = screen.getByTestId('btn-send-bill')
      userEvent.click(newBill)
      expect(handleSubmit).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith("Invalid file type");
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })
})

// test d'intégration POST
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBills Page", () => {
    test("post bills from mock POST GET", async () => {
      const store = mockStore;
      const formData = new FormData();
      formData.append('file', new File(["blobdata"], "test.pdf", { type: "application/png" }));
      formData.append('email', "test@test.ts");

      const { fileUrl, key } = await store.bills().create({
        data: formData,
        headers: {
          noContentType: true,
        },
      });
      expect(fileUrl).toBeTruthy()
      expect(key).toBe("1234")
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "e@e"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Dashboard)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})

