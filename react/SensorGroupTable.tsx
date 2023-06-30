import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "react-query";

import { SensorGroup } from "@custom-types/sensor-group";
import { useEgUserContext } from "@context/state";
import { useEgToastNotifyContext } from "@context/ToastNotifyState";
import useCSV, { PrintedData } from "@hooks/useCSV";
import useTrans from "@hooks/translate/useTrans";
import {
  useGetSensorGroups,
  useBatchDeleteSensorGroups,
} from "@hooks/query/useSensorGroup";

export type RowData = {
  sensorGroup: SensorGroup;
  isChecked: boolean;
  url: string;
};

type WrapperProps = {
  children: (
    rowDataList: RowData[],
    isFeching: boolean,
    isDataInitialized: boolean,
    isEmpty: boolean,
    onCheck: (isChecked: boolean, index: number) => void,
    isOneChecked: boolean,
    selectAll: () => void,
    filter: string,
    setFilter: (filter: string) => void,
    printSelected: () => void,
    deleteSelected: () => void
  ) => ReactNode;
};

const Wrapper: FC<WrapperProps> = ({ children }) => {
  const t = useTrans();
  const { userInfo } = useEgUserContext();

  const { data: fetchedSensorGroups, isFetching } = useGetSensorGroups(
    userInfo?.subscription_id
  );
  const [rowDataList, setRowDataList] = useState<RowData[]>([]);
  useEffect(() => {
    if (!fetchedSensorGroups) {
      return;
    }
    const mappedSensorGroups: RowData[] = (
      fetchedSensorGroups as SensorGroup[]
    ).map((sensorGroup) => {
      return {
        isChecked: false,
        sensorGroup,
        url: `https://energygazer.dev.tsim.jp/qrcode?sensor_group_id=${sensorGroup.id}&subscription_id=${sensorGroup.subscription_id}`,
      };
    });
    setRowDataList(mappedSensorGroups);
  }, [fetchedSensorGroups]);

  const onCheck = useCallback((isChecked: boolean, index: number) => {
    setRowDataList((prev) => {
      const next = [...prev];
      next[index].isChecked = isChecked;
      return next;
    });
  }, []);

  const isOneChecked = useMemo(() => {
    return rowDataList.some((rowData) => rowData.isChecked);
  }, [rowDataList]);

  const selectAll = useCallback(() => {
    setRowDataList((prev) => {
      const next = [...prev];
      next.forEach((rowData) => {
        rowData.isChecked = true;
      });
      return next;
    });
  }, []);

  const [filter, setFilter] = useState<string>("");
  const filteredRowDataList = useMemo(() => {
    if (!filter) {
      return rowDataList;
    }
    const cleanFilter = filter.trim().toLowerCase();
    return rowDataList.filter((rowData) =>
      rowData.sensorGroup.name.trim().toLowerCase().includes(cleanFilter)
    );
  }, [filter, rowDataList]);

  const { downloadCSV } = useCSV();
  const printSelected = useCallback(() => {
    const selected = filteredRowDataList.filter((rowData) => rowData.isChecked);
    const convertedSelected: PrintedData = selected.map((rowData) => {
      return {
        [t("Sensor group name")]: rowData.sensorGroup.name,
        [t("qrcode")]: rowData.url,
      };
    });
    const filename = "Label Data";
    downloadCSV(convertedSelected, filename);
  }, [downloadCSV, filteredRowDataList, t]);

  const selectedSensorGroupIds = useMemo(() => {
    return filteredRowDataList
      .filter((rowData) => rowData.isChecked)
      .map((rowData) => rowData.sensorGroup.id);
  }, [filteredRowDataList]);
  const queryClient = useQueryClient();
  const { mutateAsync: batchDelete } = useBatchDeleteSensorGroups(
    selectedSensorGroupIds,
    userInfo?.subscription_id,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries("sensor-groups");
      },
    }
  );
  const { setToastData } = useEgToastNotifyContext();
  const deleteSelected = useCallback(async () => {
    try {
      await batchDelete({
        ids: selectedSensorGroupIds,
      });
      setToastData((prev) => {
        return [
          ...prev,
          {
            message: t("Successfully deleted sensor group(s)"),
            type: "success",
          },
        ];
      });
    } catch (_error) {
      setToastData((prev) => {
        return [
          ...prev,
          {
            message: t("Failed to delete sensor group(s)"),
            type: "error",
          },
        ];
      });
    }
  }, [batchDelete, selectedSensorGroupIds, t, setToastData]);

  const isEmpty = useMemo(() => {
    return !isFetching && rowDataList.length === 0;
  }, [isFetching, rowDataList]);

  // This is a really good way to handle refetching after mutation.
  const isDataInitialized = useMemo(() => {
    if (isFetching && !filteredRowDataList) {
      return true;
    }
    return false;
  }, [isFetching, filteredRowDataList]);

  return (
    <>
      {children(
        filteredRowDataList,
        isFetching,
        isDataInitialized,
        isEmpty,
        onCheck,
        isOneChecked,
        selectAll,
        filter,
        setFilter,
        printSelected,
        deleteSelected
      )}
    </>
  );
};

export default Wrapper;
