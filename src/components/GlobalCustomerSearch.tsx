// src/components/GlobalCustomerSearch.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Input, Dropdown, List, Avatar, Typography, Spin, Empty } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Customer } from "@/features/customers/type";

const { Text } = Typography;

interface GlobalCustomerSearchProps {
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function GlobalCustomerSearch({
  placeholder = "Tìm kiếm khách hàng...",
  style,
}: GlobalCustomerSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Debounced search function
  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query.trim(),
        globalSearch: "true", // Flag for global search
        pageSize: "10", // Limit to 10 results for dropdown
        // No includeAppointments for global search
      });

      const response = await fetch(`/api/customers?${params.toString()}`);
      const data = await response.json();

      setCustomers(data.customers || []);
      setOpen(true);
    } catch (error) {
      console.error("Global search error:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchCustomers(value);
    }, 300); // 300ms debounce
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setOpen(false);
    setSearchValue("");
    setCustomers([]);

    // Navigate to customer detail page in their clinic
    router.push(`/customers/${customer.id}`);
  };

  // Handle search submit (Enter key or search button)
  const handleSearch = (value: string) => {
    // Clear timeout and search immediately
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchCustomers(value);
  };

  // Handle input blur to close dropdown
  const handleBlur = () => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => setOpen(false), 200);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Render customer item
  const renderCustomerItem = (customer: Customer) => (
    <List.Item
      key={customer.id}
      style={{
        cursor: "pointer",
        padding: "8px 16px",
        borderBottom: "1px solid #f0f0f0",
      }}
      onClick={() => handleCustomerSelect(customer)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <List.Item.Meta
        avatar={<Avatar size="small" icon={<UserOutlined />} />}
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong>{customer.fullName}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {customer.customerCode}
            </Text>
          </div>
        }
        description={
          <div>
            <Text style={{ fontSize: "12px" }}>{customer.phone}</Text>
            {customer.clinicId && (
              <Text
                type="secondary"
                style={{ fontSize: "11px", marginLeft: "8px" }}
              >
                • {customer.clinicId}
              </Text>
            )}
          </div>
        }
      />
    </List.Item>
  );

  // Dropdown content
  const dropdownContent = (
    <div
      style={{
        width: "400px",
        maxHeight: "400px",
        backgroundColor: "white",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        border: "1px solid #d9d9d9",
      }}
    >
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin size="small" />
          <Text style={{ marginLeft: "8px", color: "#666" }}>
            Đang tìm kiếm...
          </Text>
        </div>
      ) : customers.length > 0 ? (
        <>
          <div
            style={{
              padding: "8px 16px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#fafafa",
            }}
          >
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Tìm thấy {customers.length} khách hàng{" "}
              {customers.length >= 10 ? "(hiển thị 10 đầu tiên)" : ""}
            </Text>
          </div>
          <List
            dataSource={customers}
            renderItem={renderCustomerItem}
            style={{ maxHeight: "320px", overflowY: "auto" }}
          />
        </>
      ) : searchValue.trim() ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy khách hàng"
            style={{ margin: 0 }}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <Dropdown
      open={
        open &&
        (loading ||
          customers.length > 0 ||
          Boolean(searchValue.trim() && !loading))
      }
      popupRender={() => dropdownContent}
      placement="bottomLeft"
      trigger={[]}
    >
      <Input.Search
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        allowClear
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        onSearch={handleSearch}
        onBlur={handleBlur}
        onFocus={() => {
          if (searchValue.trim() && customers.length > 0) {
            setOpen(true);
          }
        }}
        style={style}
      />
    </Dropdown>
  );
}
