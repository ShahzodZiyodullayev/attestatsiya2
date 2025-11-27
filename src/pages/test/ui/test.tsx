import { Container, Title, Stack, Modal, ScrollArea, Text, Flex, Button } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useDisclosure } from "@mantine/hooks";

import { TestCard } from "@/shared/test-card";
import { data } from "@/features/quiz/data/data";
import { setResult } from "@/entities/result/model";

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${mm}:${ss}`;
};

const Test = () => {
  const [opened, { open }] = useDisclosure(false);
  const [quizOpened, { open: openQuiz, close: closeQuiz }] = useDisclosure(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { quizType } = useParams();
  const [tests, setTests] = useState<any>([]);
  const dispatch = useDispatch();
  const res = useSelector((state: any) => state.result);
  const [quizStarted, setQuizStarted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(45 * 60);
  const navigate = useNavigate();

  useEffect(() => {
    if (quizType !== "quiz" || !quizStarted) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setQuizStarted(false);
          open();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [quizType, quizStarted]);

  const handleScrollToNext = (currentIndex: number) => {
    const nextCard = cardRefs.current[currentIndex + 1];

    if (nextCard) {
      setTimeout(() => {
        nextCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "end",
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (quizType === "random") {
      const allTests = Object.values(data).reduce((acc: any[], category: any) => {
        return [...acc, ...category.items];
      }, []);

      const shuffled = allTests.sort(() => Math.random() - 0.5);
      const selectedTests = shuffled.slice(0, 50).map(test => {
        const shuffledOptions = [...test.options];
        shuffledOptions.sort(() => Math.random() - 0.5);
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.correct);
        const newOptions = shuffledOptions.map((opt, index) => ({
          ...opt,
          key: String.fromCharCode(65 + index),
        }));

        return {
          ...test,
          options: newOptions,
          answerKey: String.fromCharCode(65 + newCorrectIndex),
        };
      });

      setTests({
        title: "Tasodifiy Testlar",
        items: selectedTests,
      });

      dispatch(setResult({ total: 50 }));
    } else if (quizType === "quiz") {
      openQuiz();

      const raqamli = data["raqamli"];
      const mix = data["mix"];

      const raqamliRandom = [...raqamli.items].sort(() => Math.random() - 0.5).slice(0, 40);

      const mixRandom = [...mix.items].sort(() => Math.random() - 0.5).slice(0, 10);

      const combined = [...raqamliRandom, ...mixRandom].sort(() => Math.random() - 0.5);

      const itemsWithShuffledOptions = combined.map(test => {
        const shuffledOptions = [...test.options].sort(() => Math.random() - 0.5);

        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.correct);

        const newOptions = shuffledOptions.map((opt, index) => ({
          ...opt,
          key: String.fromCharCode(65 + index),
        }));

        return {
          ...test,
          options: newOptions,
          answerKey: String.fromCharCode(65 + newCorrectIndex),
        };
      });

      setTests({
        title: "Raqamli + Mix (50 ta test)",
        items: itemsWithShuffledOptions.map((item, index) => ({ ...item, order: index + 1 })),
      });

      dispatch(
        setResult({
          total: itemsWithShuffledOptions.length,
        }),
      );
    } else {
      const originalTests = data[quizType as keyof typeof data];
      const testsWithShuffledOptions = {
        ...originalTests,
        items: originalTests.items.map(test => {
          const shuffledOptions = [...test.options];
          shuffledOptions.sort(() => Math.random() - 0.5);
          const newCorrectIndex = shuffledOptions.findIndex(opt => opt.correct);
          const newOptions = shuffledOptions.map((opt, index) => ({
            ...opt,
            key: String.fromCharCode(65 + index),
          }));

          return {
            ...test,
            options: newOptions,
            answerKey: String.fromCharCode(65 + newCorrectIndex),
          };
        }),
      };

      setTests(testsWithShuffledOptions);
      dispatch(
        setResult({
          total: testsWithShuffledOptions.items.length || 0,
        }),
      );
    }
  }, [data, quizType]);

  useEffect(() => {
    let isEnd = res.correct + res.incorrect === res.total;
    if (isEnd && !!res.total) open();
  }, [res]);

  return (
    <ScrollArea h="100vh" offsetScrollbars style={{ overflow: "auto" }}>
      <Container size="md" py="xl">
        <Title mb={30} ta="center">
          {tests?.title}
        </Title>
        <Stack gap="lg">
          {tests?.items?.length &&
            tests.items.map((test: any, index: number) => (
              <TestCard
                key={test.order}
                test={test}
                ref={(el: any) => (cardRefs.current[index] = el)}
                onOptionSelect={() => handleScrollToNext(index)}
              />
            ))}
        </Stack>

        {quizType === "quiz" && (
          <Modal opened={quizOpened} onClose={() => null} withCloseButton={false} centered>
            Bu yerda sizga 50 ta test taqdim etiladi: 40 ta "Raqamli texnologiyalar" bo'yicha va 10
            ta "Barchaga" mo'ljallangan testlar. Testlar tasodifiy tarzda tanlangan. 45 daqiqa
            vaqtingiz bor. Testni boshlash uchun "Boshlash" tugmasini bosing.
            <Flex mt={10} justify="flex-end" gap="md">
              <Button
                color="cyan"
                onClick={() => {
                  setQuizStarted(true);
                  closeQuiz();
                }}>
                Boshlash
              </Button>
              <Button color="red" onClick={() => navigate("..")}>
                Orqaga
              </Button>
            </Flex>
          </Modal>
        )}

        {quizType === "quiz" && (
          <Modal
            opened={quizStarted}
            onClose={() => null}
            withCloseButton={false}
            withinPortal={true}
            lockScroll={false}
            styles={{
              content: {
                backdropFilter: "blur(10px)",
                background: "rgba(143,143,143,0.43)",
              },
              body: { background: "transparent" },
            }}
            shadow="lg"
            padding="xs"
            yOffset={10}
            withOverlay={false}>
            <Flex justify="space-between" align="center">
              <Text fw="bold" fz="xl">
                {formatTime(remainingSeconds)}
              </Text>
              <Button
                color="red"
                onClick={() => {
                  setQuizStarted(false);
                  open();
                }}>
                Yakunlash
              </Button>
            </Flex>
          </Modal>
        )}

        <Modal
          opened={opened}
          onClose={() => null}
          withCloseButton={false}
          title="Natijalar"
          centered>
          <Stack gap={0}>
            <Flex justify="space-between">
              <Text>To'g'ri javoblar: </Text>
              <Text>{res.correct}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Noto'g'ri javoblar: </Text>
              <Text>{res.incorrect}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Javobsiz qoldirilganlar: </Text>
              <Text>{res.unanswered}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Foiz: </Text>
              <Text>{((res.correct / res.total) * 100).toFixed(1)} %</Text>
            </Flex>
            <Flex justify="space-between">
              <Text>Jami savollar: </Text>
              <Text>{res.total}</Text>
            </Flex>
          </Stack>
          <Flex justify="flex-end">
            <Button mt="md" onClick={() => navigate("..")}>
              Bosh sahifaga
            </Button>
          </Flex>
        </Modal>
      </Container>
    </ScrollArea>
  );
};

export default Test;
