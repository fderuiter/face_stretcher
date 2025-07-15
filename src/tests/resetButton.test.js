import { initResetButton } from "../ui/resetButton.js";

describe("reset button UI", () => {
  test("click triggers callback", () => {
    document.body.innerHTML = '<button id="reset-btn"></button>';
    const cb = jest.fn();
    const control = initResetButton(cb);
    document.getElementById("reset-btn").click();
    expect(cb).toHaveBeenCalled();
    control.destroy();
  });
});
