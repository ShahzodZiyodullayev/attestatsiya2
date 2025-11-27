import { Group, Radio, Text } from "@mantine/core";
import { useParams } from "react-router-dom";

import classes from "./tests.module.pcss";

const TestCardOptions = ({ option, value }: any) => {
  const { quizType } = useParams();

  const isSelected = value === option.text;

  let bg = "#f2f4f6";

  if (quizType === "quiz") {
    bg = isSelected ? "#bababa" : "#f2f4f6";
  } else {
    if (!value) {
      bg = "#f2f4f6";
    } else if (isSelected && option.correct) {
      bg = "#b8e3cf";
    } else if (isSelected && !option.correct) {
      bg = "#fbbab6";
    } else if (!isSelected && option.correct) {
      bg = "#b8e3cf";
    } else {
      bg = "#f2f4f6";
    }
  }

  return (
    <Radio.Card
      disabled={!!value}
      bg={bg}
      className={`${classes.root} ${value === option.text ? (quizType === "quiz" ? classes.neutral : option.correct ? classes.correct : classes.incorrect) : ""}`}
      radius="md"
      value={option.text}
      key={option.text}>
      <Group wrap="nowrap" align="flex-start">
        <Text className={classes.label}>{`${option.key}. ${option.text}`}</Text>
      </Group>
    </Radio.Card>
  );
};

export default TestCardOptions;
