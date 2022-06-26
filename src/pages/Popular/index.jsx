import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, message as alertMessage } from 'antd';
import request from '@/utils/request';
import Header from './Header';
import Content from './Content';
import './index.less';

const GitHubHot = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const { search } = useLocation();
  const type = (search.length > 0 && search?.match(/(?<=language=).+/)[0]) || 'all';
  document.addEventListener('scroll', () => {
    const height = document.documentElement.clientHeight;
    const { scrollHeight } = document.documentElement || document.body;
    const { scrollTop } = document.documentElement || document.body;
    if (scrollTop + height >= scrollHeight - 50 && !loading) {
      setLoading(true);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setPage(1);
      setLoading(true);
      setData([]);
      try {
        const res = await request.get(
          `https://api.github.com/search/repositories?q=stars:%3E1${
            type !== 'All' ? `+language:${type}` : ''
          }&sort=stars&order=desc&type=Repositories&page=${1}`,
        );
        setData(res.items);
        setLoading(false);
      } catch (error) {
        setMessage(error.response.data?.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  useEffect(() => {
    const fetchData = async () => {
      if (loading && data.length > 0) {
        try {
          const res = await request.get(
            `https://api.github.com/search/repositories?q=stars:%3E1${
              type !== 'All' ? `+language:${type}` : ''
            }&sort=stars&order=desc&type=Repositories&page=${page + 1}`,
          );
          setData([...data, ...res.items]);
          setLoading(false);
          setPage(page + 1);
        } catch (error) {
          alertMessage.warning(error.response.data?.message);
          setLoading(false);
          document.documentElement.scrollTop -= 51;
        }
      }
    };
    fetchData();
  }, [loading]);

  return (
    <div>
      <Header />
      {message && (
        <Alert
          type="error"
          message={message}
          closable
          onClose={() => setMessage('')} />
      )}
      <Content data={data} loading={loading} />
    </div>
  );
};

export default GitHubHot;
