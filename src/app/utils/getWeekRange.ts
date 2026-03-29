export const getWeekRange = () => {
  const today = new Date();

  const saturday = new Date(today);
  saturday.setDate(saturday.getDate() - saturday.getDay());

  const friday = new Date(saturday);
  friday.setDate(friday.getDate() + 6);

    const format = (date: Date) => {
        date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    return `${format(saturday)} - ${format(friday)}`;
}