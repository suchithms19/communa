import { Snowflake } from '@theinternetfolks/snowflake';

const generateId = (): string => {
    return Snowflake.generate();
};

export { generateId }; 