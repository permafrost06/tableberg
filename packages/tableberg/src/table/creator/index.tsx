import TablebergIcon from "@tableberg/shared/icons/tableberg";
import {
    AITableIcon,
    DataTableIcon,
    PostsTableIcon,
    PreBuiltTableIcon,
    WooTableIcon,
} from "@tableberg/shared/icons/table-creation";
import { TablebergBlockAttrs } from "@tableberg/shared/types";
import { BlockIcon, store } from "@wordpress/block-editor";
import {
    InnerBlockTemplate,
    cloneBlock,
    createBlock,
    createBlocksFromInnerBlocksTemplate,
} from "@wordpress/blocks";
import { Button, Flex, Placeholder, TextControl } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { useState } from "react";
import metadata from "../../block.json";
import PatternsLibrary from "./Patterns";
import LockedTableType from "../../components/LockedTableType";
import UpsellModal from "../../components/UpsellModal";

interface Props {
    clientId: string;
    proProps?: {
        onCreateWooTable: (storeActions: any) => void;
        AITableModal?: React.ComponentType<{
            onClose: () => void;
            onInsert: (block: any) => void;
            currentBlockId: string;
        }>;
    };
}

export default function TableCreator({ clientId, proProps }: Props) {
    const storeActions: BlockEditorStoreActions = useDispatch(store) as any;

    const [rows, setRows] = useState<number | undefined>(4);
    const [cols, setCols] = useState<number | undefined>(4);

    const [modal, setModal] = useState<null | "patterns" | "ai" | "ai-upsell">(null);

    const onCreateNew = () => {
        if (!rows || !cols) return;
        if (rows < 1 || cols < 1) return;

        let initialInnerBlocks: InnerBlockTemplate[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                initialInnerBlocks.push([
                    "tableberg/cell",
                    { row: i, col: j },
                    [["core/paragraph"]],
                ]);
            }
        }

        storeActions.replaceInnerBlocks(
            clientId,
            createBlocksFromInnerBlocksTemplate(initialInnerBlocks),
        );

        storeActions.updateBlockAttributes(clientId, {
            version: metadata.version,
            cells: initialInnerBlocks.length,
            rows,
            cols,
        });
    };

    const IS_PRO = TABLEBERG_CFG.IS_PRO;

    return (
        <div className="tableberg-table-creator">
            <Placeholder
                label={__("Tableberg", "tableberg")}
                icon={<BlockIcon icon={TablebergIcon} />}
            >
                <div className="tableberg-table-creator-heading">
                    {__("Create Blank Table", "tableberg")}
                </div>
                <Flex gap="10px" justify="center" align="end">
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={__("Column count", "tableberg")}
                        value={String(cols)}
                        onChange={(count) => {
                            setCols(count === "" ? undefined : Number(count));
                        }}
                        min="1"
                        className="blocks-table__placeholder-input"
                    />
                    <TextControl
                        __nextHasNoMarginBottom
                        type="number"
                        label={__("Row count", "tableberg")}
                        value={String(rows)}
                        onChange={(count) => {
                            setRows(count === "" ? undefined : Number(count));
                        }}
                        min="1"
                        className="blocks-table__placeholder-input"
                    />
                    <Button
                        className="blocks-table__placeholder-button"
                        variant="primary"
                        onClick={onCreateNew}
                        type="button"
                    >
                        {__("Create", "tableberg")}
                    </Button>
                </Flex>
                <p className="tableberg-divider">
                    <span>{__("or", "tableberg")}</span>
                </p>
                <div className="tableberg-table-creator-flex">
                    <button
                        className="tableberg-table-creator-btn"
                        onClick={() => setModal("patterns")}
                    >
                        <div className="tableberg-table-creator-btn-icon">
                            {PreBuiltTableIcon}
                        </div>
                        <span>{__("Pre-Built Table", "tableberg")}</span>
                    </button>
                    {!IS_PRO ? (
                        <LockedTableType
                            icon={WooTableIcon}
                            selected={"product-table"}
                            name={__("WooCommerce Table", "tableberg")}
                            link={
                                "https://tableberg.com/woocommerce-product-table-plugin/"
                            }
                        />
                    ) : (
                        <button
                            className="tableberg-table-creator-btn"
                            onClick={() =>
                                proProps?.onCreateWooTable(storeActions)
                            }
                        >
                            <div className="tableberg-table-creator-btn-icon">
                                {WooTableIcon}
                            </div>
                            <span>{__("WooCommerce Table", "tableberg")}</span>
                        </button>
                    )}
                    <button className="tableberg-table-creator-btn tableberg-upcoming">
                        <div className="tableberg-table-creator-btn-icon">
                            {DataTableIcon}
                        </div>
                        <span>{__("Data Table (CSV, XML)", "tableberg")}</span>
                    </button>
                    <button
                        className={`tableberg-table-creator-btn ${!IS_PRO || !proProps?.
AITableModal ? 'tableberg-pro-feature' : ''}`}
                        onClick={() => {
                            if (IS_PRO && proProps?.AITableModal) {
                                setModal("ai");
                            } else {
                                setModal("ai-upsell");
                            }
                        }}
                    >
                        <div className="tableberg-table-creator-btn-icon">
                            {AITableIcon}
                        </div>
                        <span>{__("AI Table", "tableberg")}</span>
                        {IS_PRO && (
                            <span className="tableberg-table-creator-btn-badge">Pro</span>
                        )}
                    </button>
                    <button className="tableberg-table-creator-btn tableberg-upcoming">
                        <div className="tableberg-table-creator-btn-icon">
                            {PostsTableIcon}
                        </div>
                        <span>{__("Posts Table", "tableberg")}</span>
                    </button>
                </div>
            </Placeholder>
            {modal === "patterns" && (
                <PatternsLibrary
                    onClose={() => setModal(null)}
                    onSelect={(b) =>
                        storeActions.replaceBlock(clientId, cloneBlock(b))
                    }
                />
            )}
            {modal === "ai" && proProps?.AITableModal && (
                <proProps.AITableModal
                    onClose={() => setModal(null)}
                    onInsert={(block) => {
                        storeActions.replaceBlock(clientId, block);
                    }}
                    currentBlockId={clientId}
                />
            )}
            {modal === "ai-upsell" && (
                <UpsellModal
                    onClose={() => setModal(null)}
                    selected="ai-table"
                />
            )}
        </div>
    );
}