import { StaffMemberStatus } from "@dashboard/graphql";
import { createFilterStructure } from "@dashboard/staff/components/StaffListPage";
import { StaffListUrlFilters } from "@dashboard/staff/urls";
import { getFilterQueryParams } from "@dashboard/utils/filters";
import { stringifyQs } from "@dashboard/utils/urls";
import { getExistingKeys, setFilterOptsStatus } from "@test/filters";
import { config } from "@test/intl";
import { createIntl } from "react-intl";

import { getFilterQueryParam, getFilterVariables } from "./filters";

describe("Filtering query params", () => {
  it("should be empty object if no params given", () => {
    const params: StaffListUrlFilters = {};
    const filterVariables = getFilterVariables(params);

    expect(getExistingKeys(filterVariables)).toHaveLength(0);
  });
  it("should not be empty object if params given", () => {
    const params: StaffListUrlFilters = {
      status: StaffMemberStatus.ACTIVE,
    };
    const filterVariables = getFilterVariables(params);

    expect(getExistingKeys(filterVariables)).toHaveLength(1);
  });
});
describe("Filtering URL params", () => {
  const intl = createIntl(config);
  const filters = createFilterStructure(intl, {
    status: {
      active: false,
      value: StaffMemberStatus.ACTIVE,
    },
  });

  it("should be empty if no active filters", () => {
    const filterQueryParams = getFilterQueryParams(filters, getFilterQueryParam);

    expect(getExistingKeys(filterQueryParams)).toHaveLength(0);
  });
  it("should not be empty if active filters are present", () => {
    const filterQueryParams = getFilterQueryParams(
      setFilterOptsStatus(filters, true),
      getFilterQueryParam,
    );

    expect(filterQueryParams).toMatchSnapshot();
    expect(stringifyQs(filterQueryParams)).toMatchSnapshot();
  });
});
