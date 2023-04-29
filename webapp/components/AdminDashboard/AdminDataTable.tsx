import {
  Box,
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Tab,
  Table,
  TableContainer,
  TabList,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  Row,
  Table as TableType,
  useReactTable,
  CellContext as TanCellContext,
  RowData,
} from "@tanstack/react-table";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import React, { useEffect, useMemo, useState } from "react";

import DecryptButton from "../molecules/admin/dashboard/DecryptButton";
import EncryptedStatus from "../molecules/admin/dashboard/EncryptedStatus";

import {
  basicFevmDalnABI,
  useBasicFevmDalnGetTokenInfos,
} from "~~/generated/wagmiTypes";
import usePrepareWriteAndWaitTx from "~~/hooks/usePrepareWriteAndWaitTx";

type Item = {
  id: BigNumber;
  cid: string;
  isDecrypted: boolean;
  owner: string;
  price: BigNumber;
};

const columnHelper = createColumnHelper<Item>();

type CellContext<TData extends RowData, TValue> = TanCellContext<
  TData,
  TValue
> & {
  hover: boolean;
  setPressedDecryptRow: () => void;
};

const columns = [
  {
    id: "select",
    header: ({ table }: { table: TableType<Item> }) => (
      <Checkbox
        {...{
          isChecked: table.getIsAllRowsSelected(),
          isIndeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }: { row: Row<Item> }) => (
      <div className="px-1">
        <Checkbox
          {...{
            isChecked: row.getIsSelected(),
            isDisabled: !row.getCanSelect(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      </div>
    ),
  },
  columnHelper.accessor("id", {
    header: () => "Token Id",
    cell: (item) => (
      <Flex>
        <Text>{item.getValue().toString()}</Text>
      </Flex>
    ),
  }),

  columnHelper.accessor("owner", {
    header: () => "Holder Wallet Address",
    cell: (item) => (
      <Flex>
        <Text>{item.getValue()}</Text>
      </Flex>
    ),
  }),
  columnHelper.accessor("cid", {
    header: () => "CID",
    cell: (item) => (
      <Flex>
        <Text>{item.getValue()}</Text>
      </Flex>
    ),
  }),
  columnHelper.accessor("price", {
    header: () => "Session Payment",
    cell: (item) => <Text>{formatUnits(item.getValue(), "ether")} FIL</Text>,
  }),
  columnHelper.accessor("isDecrypted", {
    header: () => "Status",
    cell: (item: unknown) => {
      const itemCasted = item as CellContext<Row<Item>, boolean>;
      const isDecrypted = itemCasted.getValue();
      return !isDecrypted && itemCasted.hover ? (
        <DecryptButton onClick={itemCasted.setPressedDecryptRow} />
      ) : (
        <EncryptedStatus
          isDecrypted={itemCasted.getValue()}
          cid={itemCasted.row.getValue("cid")}
        />
      );
    },
  }),
];

const isDecryptedFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const isDecrypted = value === "Decrypted";
  if (value) {
    return row.getValue("isDecrypted") === isDecrypted;
  }
  return true;
};

export default function AdminDataTable({
  onPaymentSuccess,
}: {
  onPaymentSuccess: (payment: {
    totalPaid: number;
    decryptedDataAmount: number;
  }) => void;
}) {
  const getTokenInfos = useBasicFevmDalnGetTokenInfos({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    args: [BigNumber.from(0), BigNumber.from(10)],
    watch: true,
  });

  const tokenInfos = useMemo(() => {
    if (!getTokenInfos.data?.[0] || !getTokenInfos.isSuccess) return [];
    return getTokenInfos.data[0].map(
      ({ cid, isDecrypted, owner, id, price }) => ({
        id,
        cid,
        isDecrypted,
        owner,
        price,
      })
    );
  }, [getTokenInfos.data, getTokenInfos.isSuccess]);

  console.log("tokenInfos", getTokenInfos);

  const decryptMutation = usePrepareWriteAndWaitTx({
    address: process.env.NEXT_PUBLIC_DALN_CONTRACT_ADDRESS as `0x${string}`,
    abi: basicFevmDalnABI,
    functionName: "decrypt",
    args: [[tokenInfos?.[0] ? tokenInfos?.[0].id : undefined]],
    overrides: {
      value: tokenInfos?.[0] ? tokenInfos[0].price : undefined,
    },
  });

  const [isMouseOverRowId, setIsMouseOverRowId] = useState("");

  const [pressedDecryptRow, setPressedDecryptRow] = useState<Row<Item> | null>(
    null
  );

  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [statusFilter, setStatusFilter] = React.useState<
    null | "Decrypted" | "Encrypted"
  >(null);

  const handleTabsChange = (index: number) => {
    switch (index) {
      case 0:
        setStatusFilter(null);
        break;
      case 1:
        setStatusFilter("Encrypted");
        break;
      case 2:
        setStatusFilter("Decrypted");
        break;
      default:
        setStatusFilter(null);

        break;
    }
  };

  const table = useReactTable({
    data: tokenInfos,
    columns,
    state: {
      rowSelection,
      globalFilter: statusFilter,
    },
    enableRowSelection: (row) => {
      return !row.getValue("isDecrypted");
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: isDecryptedFilterFn,
    onGlobalFilterChange: setStatusFilter,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      isDecryptedFilterFn,
    },
  });

  const rowSelectedIds = Object.keys(rowSelection);
  const rowSelectedqty = rowSelectedIds.length;
  const rowSelectedTotalSessionPayment = useMemo(() => {
    rowSelectedIds;
    let totalSessionPaymentAux = 0;
    rowSelectedIds.forEach((id) => {
      const paymentAmount: number = table.getRow(id).getValue("sessionPayment");
      totalSessionPaymentAux += paymentAmount;
    });
    return totalSessionPaymentAux.toFixed(2);
  }, [table, rowSelectedIds]);

  useEffect(() => {
    if (pressedDecryptRow) {
      onOpen();
    }
  }, [pressedDecryptRow, onOpen]);

  return (
    <>
      <TableContainer>
        <Flex marginBottom={3} alignItems="center">
          <Tabs onChange={handleTabsChange}>
            <TabList>
              <Tab>All data</Tab>
              <Tab>Encrypted data</Tab>
              <Tab>Decrypted data</Tab>
            </TabList>
          </Tabs>
          <Spacer />
          {rowSelectedqty > 0 ? (
            <>
              <Text
                color={"gray.500"}
                fontSize="sm"
                marginX={6}
              >{`${rowSelectedTotalSessionPayment} Matic total session payment`}</Text>
              <Button minWidth={"220px"} onClick={onOpen}>
                <Text>{`${`Decrypt selected ${rowSelectedqty} data set${
                  rowSelectedqty > 1 ? "s" : ""
                }`}`}</Text>
              </Button>
            </>
          ) : null}
        </Flex>
        <Box overflowY="auto" maxHeight="60vh">
          <Table
            colorScheme="gray"
            overflow="hidden"
            borderRadius="lg"
            borderBottom="2px solid white"
          >
            <Thead bgColor="#E6EDF9">
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody bgColor="white" fontSize="sm">
              {table.getRowModel().rows.map((row: Row<Item>) => {
                return (
                  <Tr
                    key={row.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#F1F4F9",
                      },
                    }}
                    onMouseEnter={() => {
                      setIsMouseOverRowId(row.id);
                    }}
                    onMouseLeave={() => {
                      setIsMouseOverRowId("");
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, {
                          ...cell.getContext(),
                          hover: row.id === isMouseOverRowId,
                          setPressedDecryptRow: () => setPressedDecryptRow(row),
                        })}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </TableContainer>
      <>
        <Modal
          isOpen={isOpen}
          onClose={() => {
            setPressedDecryptRow(null);
            onClose();
          }}
          isCentered
          size="sm"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader alignSelf="center">Decrypt Data</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex justifyContent="space-between" mb={2}>
                <Text>Data sets #</Text>
                <Text>{pressedDecryptRow ? 1 : rowSelectedqty}</Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text>Total Payment</Text>
                <Text>
                  {pressedDecryptRow
                    ? pressedDecryptRow.getValue("sessionPayment")
                    : rowSelectedTotalSessionPayment}{" "}
                  Matic
                </Text>
              </Flex>
            </ModalBody>

            <ModalFooter justifyContent={"space-between"}>
              {isWaitingForApproval ? (
                <Button size={"lg"} flex={1} isDisabled={true}>
                  Waiting for approval...
                </Button>
              ) : (
                <>
                  <Button
                    size={"lg"}
                    width={"150px"}
                    variant="ghost"
                    onClick={() => {
                      setPressedDecryptRow(null);
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size={"lg"}
                    width={"150px"}
                    onClick={() => {
                      // setIsWaitingForApproval(true);
                      decryptMutation.write?.();
                    }}
                  >
                    Confirm
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    </>
  );
}
