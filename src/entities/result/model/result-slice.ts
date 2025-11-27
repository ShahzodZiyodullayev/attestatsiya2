import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  total: 0,
  correct: 0,
  incorrect: 0,
  unanswered: 0,
};

const resultSlice = createSlice({
  name: "result",
  initialState,
  reducers: {
    setResult(state, action) {
      if (action.payload === null) {
        return initialState;
      }
      return {
        ...{
          correct: action.payload === true ? state.correct + 1 : state.correct,
          incorrect: action.payload === false ? state.incorrect + 1 : state.incorrect,
          unanswered:
            typeof action.payload === "object" ? action.payload.total : state.unanswered - 1,
          total: action.payload.total || state.total,
        },
      };
    },
  },
});

export const { setResult } = resultSlice.actions;
export default resultSlice.reducer;
