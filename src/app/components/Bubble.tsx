const Bubble = ({ message }) => {
  const { content, role } = message;
  return <div className={`${role} bubble`} dangerouslySetInnerHTML={{__html: content}}></div>;
};

export default Bubble;
