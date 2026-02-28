import { logger, pg } from "ts-commons";
import { IUser } from "../../types/custom";
import { pgQueries } from "../../enums";

export const userRepository = {
  existsByMobileNumber: async (mobileNumber: string): Promise<boolean> => {
    const logPrefix = `userRepository :: existsByMobileNumber`;
    try {
      const _query = {
        text: pgQueries.UserQueries.EXISTS_BY_MOBILE_NUMBER,
        values: [mobileNumber],
      };
      logger.debug(`${logPrefix} :: query :: ${JSON.stringify(_query)}`);

      const result = await pg.executeQueryPromise(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);

      return result[0].exists;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },

  createUser: async (userData: any): Promise<number> => {
    const logPrefix = `userRepository :: createUser`;
    try {
      const {
        full_name,
        age,
        mobile_number,
        email,
        gender,
        state,
        district,
        pincode,
        status = 1,
      } = userData;

      const _query = {
        text: pgQueries.UserQueries.CREATE_USER,
        values: [
          full_name,
          age,
          mobile_number,
          email,
          gender,
          state,
          district,
          pincode,
          status,
        ],
      };
      logger.debug(`${logPrefix} :: query :: ${JSON.stringify(_query)}`);

      const result = await pg.executeQueryPromise(_query);
      logger.debug(`${logPrefix} :: db result :: ${JSON.stringify(result)}`);

      return result[0].pledge_id;
    } catch (error) {
      logger.error(`${logPrefix} :: ${error.message} :: ${error}`);
      throw new Error(error.message);
    }
  },
};
